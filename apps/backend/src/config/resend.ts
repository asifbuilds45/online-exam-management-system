import { Resend } from 'resend';
import { config } from './env.js';

const resendClient = config.resendApiKey ? new Resend(config.resendApiKey) : null;

export async function sendEmail({
  to,
  subject,
  html,
  text
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  if (resendClient) {
    try {
      const response = await resendClient.emails.send({
        from: config.fromEmail,
        to,
        subject,
        html,
        text
      });
      console.log(`[Resend Email Sent] to ${to}: ${subject}`, response);
      return { success: true, data: response };
    } catch (error) {
      console.error('[Resend Email Error]', error);
      return { success: false, error };
    }
  } else {
    console.log(`[Mock Email Logger - Resend Key Not Configured]`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${text || html}`);
    return { success: true, mock: true };
  }
}
