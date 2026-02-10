import { Resend } from 'resend';

// Initialize Resend with API key from environment
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@physioai.online';
const APP_URL = process.env.NEXTAUTH_URL || process.env.APP_URL || 'http://localhost:3000';

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Send an email using the configured email service
 */
export async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<{ success: boolean; error?: string }> {
  // If no email service is configured, log and return success (for development)
  if (!resend) {
    console.log('Email service not configured. Skipping email send.');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('HTML:', html);
    return { success: true };
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });

    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    };
  }
}

/**
 * Send a verification email to a new user
 */
export async function sendVerificationEmail(
  email: string,
  name: string | undefined,
  token: string
): Promise<{ success: boolean; error?: string }> {
  const verifyUrl = `${APP_URL}/verify-email?token=${token}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background-color: #f9fafb;
            border-radius: 8px;
            padding: 40px;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #1f2937;
          }
          .content {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 30px;
            margin-bottom: 20px;
          }
          h1 {
            color: #1f2937;
            font-size: 24px;
            margin-bottom: 20px;
          }
          p {
            margin-bottom: 16px;
          }
          .button {
            display: inline-block;
            background-color: #3b82f6;
            color: #ffffff;
            text-decoration: none;
            padding: 12px 30px;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
          }
          .button:hover {
            background-color: #2563eb;
          }
          .footer {
            text-align: center;
            color: #6b7280;
            font-size: 14px;
            margin-top: 30px;
          }
          .link-fallback {
            color: #6b7280;
            font-size: 12px;
            word-break: break-all;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">PhysioAI.online</div>
          </div>
          <div class="content">
            <h1>Verify Your Email Address</h1>
            <p>Hi ${name || 'there'},</p>
            <p>Thank you for registering with PhysioAI.online! We're excited to help you prepare for your physiotherapy exams.</p>
            <p>Please click the button below to verify your email address:</p>
            <center>
              <a href="${verifyUrl}" class="button">Verify Email Address</a>
            </center>
            <p class="link-fallback">
              If the button doesn't work, you can copy and paste this link into your browser:<br>
              <a href="${verifyUrl}">${verifyUrl}</a>
            </p>
            <p><strong>This link will expire in 24 hours.</strong></p>
            <p>If you didn't create an account with PhysioAI.online, you can safely ignore this email.</p>
          </div>
          <div class="footer">
            <p>Need help? Contact us at support@physioai.online</p>
            <p>&copy; ${new Date().getFullYear()} PhysioAI.online. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Verify Your Email Address - PhysioAI.online',
    html,
  });
}

/**
 * Send a password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  name: string | undefined,
  token: string
): Promise<{ success: boolean; error?: string }> {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background-color: #f9fafb;
            border-radius: 8px;
            padding: 40px;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #1f2937;
          }
          .content {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 30px;
            margin-bottom: 20px;
          }
          h1 {
            color: #1f2937;
            font-size: 24px;
            margin-bottom: 20px;
          }
          p {
            margin-bottom: 16px;
          }
          .button {
            display: inline-block;
            background-color: #3b82f6;
            color: #ffffff;
            text-decoration: none;
            padding: 12px 30px;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
          }
          .button:hover {
            background-color: #2563eb;
          }
          .warning {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .footer {
            text-align: center;
            color: #6b7280;
            font-size: 14px;
            margin-top: 30px;
          }
          .link-fallback {
            color: #6b7280;
            font-size: 12px;
            word-break: break-all;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">PhysioAI.online</div>
          </div>
          <div class="content">
            <h1>Reset Your Password</h1>
            <p>Hi ${name || 'there'},</p>
            <p>We received a request to reset your password for your PhysioAI.online account.</p>
            <p>Click the button below to create a new password:</p>
            <center>
              <a href="${resetUrl}" class="button">Reset Password</a>
            </center>
            <p class="link-fallback">
              If the button doesn't work, you can copy and paste this link into your browser:<br>
              <a href="${resetUrl}">${resetUrl}</a>
            </p>
            <p><strong>This link will expire in 1 hour.</strong></p>
            <div class="warning">
              <p>If you didn't request a password reset, please ignore this email or contact us if you have concerns.</p>
            </div>
          </div>
          <div class="footer">
            <p>Need help? Contact us at support@physioai.online</p>
            <p>&copy; ${new Date().getFullYear()} PhysioAI.online. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Reset Your Password - PhysioAI.online',
    html,
  });
}
