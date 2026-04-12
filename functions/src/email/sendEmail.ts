import { Resend } from 'resend';
import { RESEND_API_KEY, APP_NAME } from '../config';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

let resendClient: Resend | null = null;

function getClient(): Resend {
  if (!resendClient) {
    resendClient = new Resend(RESEND_API_KEY.value());
  }
  return resendClient;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  const client = getClient();

  const { error } = await client.emails.send({
    from: `${APP_NAME} <onboarding@resend.dev>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });

  if (error) {
    console.error(`Email send error to ${options.to}:`, error);
    throw new Error(`Email failed: ${error.message}`);
  }

  console.log(`Email sent to ${options.to}: ${options.subject}`);
}
