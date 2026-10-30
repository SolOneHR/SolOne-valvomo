import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// CORS-määritykset sallivat pyynnöt selaimesta
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // 1. Käsittele selaimen lähettämä CORS-preflight -pyyntö (OPTIONS)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 2. Varmista JWT-token (Autentikointi)
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Puuttuva Authorization-otsikko')
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    // Tarkistetaan, että token kuuluu oikealle kirjautuneelle käyttäjälle
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('Virheellinen tai vanhentunut token')
    }

    // 3. Lue saapuva data (body)
    const body = await req.json()
    
    // Erotetaan 'action' (esim. 'ai-format') ja loput datasta ('payload')
    const { action, ...payload } = body

    // 4. Reititys action-parametrin perusteella
    let webhookUrl = ''
    switch (action) {
      case 'ai-format':
        webhookUrl = Deno.env.get('MAKE_WEBHOOK_AI_FORMAT') ?? ''
        break
      case 'publish':
        webhookUrl = Deno.env.get('MAKE_WEBHOOK_PUBLISH') ?? ''
        break
      case 'new-draft':
        webhookUrl = Deno.env.get('MAKE_WEBHOOK_NEW_DRAFT') ?? ''
        break
      case 'new-order':
        webhookUrl = Deno.env.get('MAKE_WEBHOOK_NEW_ORDER') ?? ''
        break
      case 'update-customer':
        webhookUrl = Deno.env.get('MAKE_WEBHOOK_UPDATE_CUSTOMER') ?? ''
        break
      default:
        throw new Error(`Tuntematon toiminto (action): ${action}`)
    }

    if (!webhookUrl) {
      throw new Error(`Webhook-osoitetta ei löydy toiminnolle: ${action} tai salaisuutta ei ole asetettu.`)
    }

    // 5. Lähetä data eteenpäin Make.comiin (Proxy)
    const makeResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload) // Lähetetään Make.comiin vain payload, ei action-sanaa
    })

    // Luetaan Maken palauttama vastaus (voi olla JSON tai teksti)
    const makeData = await makeResponse.text()

    // 6. Palauta Maken vastaus takaisin frontendille
    return new Response(makeData, {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    // Virheiden hallinta ja palautus selaimelle
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})