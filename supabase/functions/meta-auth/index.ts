import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { shortLivedToken, asiakastunnus } = await req.json();

    if (!shortLivedToken || !asiakastunnus) {
      return new Response(
        JSON.stringify({ error: "shortLivedToken ja asiakastunnus vaaditaan." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const appId = Deno.env.get("META_APP_ID");
    const appSecret = Deno.env.get("META_APP_SECRET");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!appId || !appSecret || !supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: "Palvelinympäristön muuttujia puuttuu (META_APP_ID / SECRET / SUPABASE)." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Vaihdetaan lyhytkestoinen token pitkäkestoiseksi käyttäjätunnisteeksi
    const tokenExchangeUrl = `https://graph.facebook.com/v20.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${shortLivedToken}`;
    const tokenRes = await fetch(tokenExchangeUrl);
    const tokenData = await tokenRes.json();

    if (tokenData.error) {
      return new Response(
        JSON.stringify({ error: "Virhe Metan token-vaihdossa", details: tokenData.error }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const longLivedUserToken = tokenData.access_token;

    // 2. Haetaan sivut ja niihin liitetyt Instagram-yritystilit
    const pagesUrl = `https://graph.facebook.com/v20.0/me/accounts?fields=id,name,access_token,instagram_business_account{id}&access_token=${longLivedUserToken}`;
    const pagesRes = await fetch(pagesUrl);
    const pagesData = await pagesRes.json();

    if (pagesData.error) {
      return new Response(
        JSON.stringify({ error: "Virhe sivujen haussa", details: pagesData.error }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Tallennetaan sivut asiakkaan_sometilit -tauluun
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const savedRows = [];

    if (pagesData.data && Array.isArray(pagesData.data)) {
      for (const page of pagesData.data) {
        const igId = page.instagram_business_account?.id || null;

        // Tarkistetaan löytyykö jo sivu tällä fb_page_id:llä tälle asiakkaalle
        const { data: existing } = await supabaseAdmin
          .from("asiakkaan_sometilit")
          .select("id")
          .eq("asiakastunnus", asiakastunnus)
          .eq("fb_page_id", page.id)
          .maybeSingle();

        const rowData = {
          asiakastunnus: asiakastunnus,
          fb_page_id: page.id,
          sivun_nimi: page.name,
          page_access_token: page.access_token,
          ig_account_id: igId,
          aktiivinen: true,
          ensisijainen: true
        };

        let result;
        if (existing?.id) {
          result = await supabaseAdmin
            .from("asiakkaan_sometilit")
            .update(rowData)
            .eq("id", existing.id)
            .select();
        } else {
          result = await supabaseAdmin
            .from("asiakkaan_sometilit")
            .insert(rowData)
            .select();
        }

        if (result.data) {
          savedRows.push(...result.data);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Meta-tilit kytketty onnistuneesti",
        count: savedRows.length,
        rows: savedRows
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "Tuntematon palvelinvirhe" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});