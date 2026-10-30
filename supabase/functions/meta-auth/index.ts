import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
const shortLivedToken = body.shortLivedToken;
const userEmail = body.userEmail || body.asiakastunnus;

    if (!shortLivedToken || !userEmail) {
      return new Response(
        JSON.stringify({ error: "shortLivedToken ja userEmail ovat pakollisia." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const appId = Deno.env.get("META_APP_ID");
    const appSecret = Deno.env.get("META_APP_SECRET");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!appId || !appSecret || !supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: "Palvelimen ympäristömuuttujat puuttuvat." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Vaihdetaan lyhytikäinen käyttäjätunnus pitkäikäiseen käyttäjätunnukseen
    const exchangeUrl = `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${shortLivedToken}`;
    const exchangeRes = await fetch(exchangeUrl);
    const exchangeData = await exchangeRes.json();

    if (exchangeData.error) {
      console.error("Meta token exchange error:", exchangeData.error);
      return new Response(
        JSON.stringify({ error: exchangeData.error.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const longLivedUserToken = exchangeData.access_token;

    // 2. Haetaan kaikki sivut, joihin käyttäjällä on oikeus
    const pagesUrl = `https://graph.facebook.com/v19.0/me/accounts?access_token=${longLivedUserToken}`;
    const pagesRes = await fetch(pagesUrl);
    const pagesData = await pagesRes.json();

    if (pagesData.error) {
      console.error("Meta pages fetch error:", pagesData.error);
      return new Response(
        JSON.stringify({ error: pagesData.error.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const pages = pagesData.data || [];
    if (pages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Käyttäjällä ei ole hallinnoitavia Facebook-sivuja." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Tallennetaan tai päivitetään sivut tietokantaan
    for (const page of pages) {
      let igAccountId: string | null = null;
      try {
        const igRes = await fetch(
          `https://graph.facebook.com/v19.0/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`
        );
        const igData = await igRes.json();
        if (igData.instagram_business_account && igData.instagram_business_account.id) {
          igAccountId = igData.instagram_business_account.id;
        }
      } catch (igErr) {
        console.error(`Virhe haettaessa IG-tiliä sivulle ${page.name}:`, igErr);
      }

      // Tarkistetaan onko käyttäjällä jo olemassa jokin ensisijainen tili
      const { data: primaryRow } = await supabaseAdmin
        .from("asiakkaan_sometilit")
        .select("id")
        .eq("asiakastunnus", userEmail)
        .eq("ensisijainen", true)
        .maybeSingle();

      const shouldBePrimary = !primaryRow;

      // Upsert: päivittää olemassa olevan rivin tokenin tai lisää uuden (ei duplikaatteja)
      const { error: upsertErr } = await supabaseAdmin
        .from("asiakkaan_sometilit")
        .upsert(
          {
            asiakastunnus: userEmail,
            fb_page_id: page.id,
            sivun_nimi: page.name,
            page_access_token: page.access_token,
            ig_account_id: igAccountId || null,
            ensisijainen: shouldBePrimary,
          },
          {
            onConflict: "asiakastunnus,fb_page_id",
          }
        );

      if (upsertErr) {
        console.error(`Virhe tallennettaessa sivua ${page.name}:`, upsertErr);
      }
    }

    return new Response(
      JSON.stringify({ success: true, count: pages.length }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("meta-auth odottamaton virhe:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Sisäinen palvelinvirhe." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});