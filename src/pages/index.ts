import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

serve(async (req) => {
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Ricevi il payload dal webhook di Supabase
    const payload = await req.json()
    const { record, type } = payload

    // Procedi solo per nuove registrazioni aziende
    if (type !== 'INSERT') {
      return new Response(JSON.stringify({ message: 'Skipping: not an insert' }), { status: 200 })
    }

    // Recupera l'email dell'azienda per log o riferimento
    const { data: authUser } = await supabaseClient.auth.admin.getUserById(record.id)
    const companyEmail = authUser.user?.email || 'N/A'

    // Invia l'email di notifica lead a Advisor.impresa@gmail.com
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'JobTV Leads <leads@jobtv.it>',
        to: ['Advisor.impresa@gmail.com'],
        subject: `🚀 NUOVA AZIENDA REGISTRATA: ${record.company_name}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
            <h2 style="color: #1599dd;">Nuova Opportunità Lead</h2>
            <p>Un'azienda si è appena registrata su JobTV. Ecco i dettagli:</p>
            <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Azienda:</strong> ${record.company_name}</p>
              <p style="margin: 5px 0;"><strong>Email:</strong> ${companyEmail}</p>
              <p style="margin: 5px 0;"><strong>Telefono:</strong> ${record.phone || 'Non fornito'}</p>
              <p style="margin: 5px 0;"><strong>Città:</strong> ${record.city || 'Non fornita'}</p>
              <p style="margin: 5px 0;"><strong>P.IVA:</strong> ${record.vat_number || 'Non fornita'}</p>
            </div>
            <p>Contattali subito per presentare i piani Builder o Hero.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin-top: 30px;">
            <p style="font-size: 12px; color: #94a3b8; text-align: center;">Sistema Notifiche JobTV</p>
          </div>
        `,
      }),
    })

    return new Response(JSON.stringify({ success: true }), { 
      headers: { "Content-Type": "application/json" },
      status: 200 
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      headers: { "Content-Type": "application/json" },
      status: 500 
    })
  }
})
