// ============================================================================
// SMTP Configuration for JobTV Email Service
// ============================================================================

export const smtpConfig = {
  host: process.env.SMTP_HOST || 'smtp-pulse.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || 'advisor.impresa@gmail.com',
    pass: process.env.SMTP_PASS || ''
  },
  from: {
    name: process.env.SMTP_FROM_NAME || 'JobTV',
    address: process.env.SMTP_FROM_ADDRESS || 'info@jobtv.it'
  }
};

// Email templates
export const emailTemplates = {
  confirmation: (name, confirmUrl) => ({
    subject: 'Conferma la tua registrazione su JobTV',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Conferma la tua registrazione</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3b82f6, #14b8a6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #3b82f6, #14b8a6); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Benvenuto su JobTV! 👋</h1>
          </div>
          <div class="content">
            <p>Ciao ${name},</p>
            <p>Grazie per esserti registrato su JobTV. Per completare la tua registrazione, clicca sul pulsante sottostante:</p>
            <center>
              <a href="${confirmUrl}" class="button">Conferma la tua Email</a>
            </center>
            <p>Oppure copia e incolla questo link nel tuo browser:</p>
            <p style="word-break: break-all; color: #3b82f6;">${confirmUrl}</p>
            <p><strong>Questo link scadrà tra 24 ore.</strong></p>
            <p>Se non hai richiesto questa registrazione, puoi ignorare questa email.</p>
          </div>
          <div class="footer">
            <p>© 2025 JobTV. Tutti i diritti riservati.</p>
            <p>Questo è un messaggio automatico, non rispondere a questa email.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  welcome: (name) => ({
    subject: 'Benvenuto in JobTV!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Benvenuto in JobTV</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3b82f6, #14b8a6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Registrazione Completata! 🎉</h1>
          </div>
          <div class="content">
            <p>Ciao ${name},</p>
            <p>La tua email è stata confermata con successo. Ora puoi accedere a tutte le funzionalità di JobTV!</p>
            <p>Inizia subito ad esplorare le opportunità che awaitti.</p>
          </div>
          <div class="footer">
            <p>© 2025 JobTV. Tutti i diritti riservati.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  passwordReset: (name, resetUrl) => ({
    subject: 'Reset della tua password JobTV',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Password</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3b82f6, #14b8a6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #3b82f6, #14b8a6); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Reset Password 🔑</h1>
          </div>
          <div class="content">
            <p>Ciao ${name},</p>
            <p>Hai richiesto di resettare la tua password. Clicca sul pulsante sottostante per impostare una nuova password:</p>
            <center>
              <a href="${resetUrl}" class="button">Resetta la Password</a>
            </center>
            <p>Oppure copia e incolla questo link nel tuo browser:</p>
            <p style="word-break: break-all; color: #3b82f6;">${resetUrl}</p>
            <p><strong>Questo link scadrà tra 1 ora.</strong></p>
            <p>Se non hai richiesto questo reset, ignora questa email e la tua password rimarrà invariata.</p>
          </div>
          <div class="footer">
            <p>© 2025 JobTV. Tutti i diritti riservati.</p>
            <p>Questo è un messaggio automatico, non rispondere a questa email.</p>
          </div>
        </div>
      </body>
      </html>
    `
  })
};
