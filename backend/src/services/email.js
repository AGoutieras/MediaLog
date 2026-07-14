import { BrevoClient } from '@getbrevo/brevo'

/**
 * Sends an email verification code to a newly registered user.
 */
export async function sendVerificationEmail(email, token) {
  const client = new BrevoClient({ apiKey: process.env.BREVO_API_KEY })

  await client.transactionalEmails.sendTransacEmail({
    sender: { name: 'MediaLog', email: process.env.SENDER_EMAIL },
    to: [{ email }],
    subject: 'Your MediaLog verification code',
    htmlContent: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Welcome to MediaLog</h2>
        <p>Enter this code to verify your email address:</p>
        <div style="font-size: 2.5rem; font-weight: bold; letter-spacing: 0.3em; color: #6c40c4; margin: 24px 0;">
          ${token}
        </div>
        <p style="color: #888; font-size: 0.85rem;">This code expires in 24 hours.</p>
      </div>
    `,
  })
}

/**
 * Sends a password reset code.
 */
export async function sendResetPasswordEmail(email, token) {
  const client = new BrevoClient({ apiKey: process.env.BREVO_API_KEY })

  await client.transactionalEmails.sendTransacEmail({
    sender: { name: 'MediaLog', email: process.env.SENDER_EMAIL },
    to: [{ email }],
    subject: 'Reset your MediaLog password',
    htmlContent: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Reset your password</h2>
        <p>Enter this code to reset your password. It expires in 1 hour.</p>
        <div style="font-size: 2.5rem; font-weight: bold; letter-spacing: 0.3em; color: #6c40c4; margin: 24px 0;">
          ${token}
        </div>
        <p style="color: #888; font-size: 0.85rem;">If you didn't request this, ignore this email.</p>
      </div>
    `,
  })
}