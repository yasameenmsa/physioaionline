import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

const FROM = process.env.EMAIL_FROM || 'noreply@physioai.online';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

function buildHtml(arabicBody: string, englishBody: string): string {
  const year = new Date().getFullYear();
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body { margin: 0; padding: 0; background-color: #f2f4f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.7; color: #1f2937; }
      .outer { background: linear-gradient(135deg, #eff6ff 0%, #f2f4f8 100%); padding: 40px 20px; }
      .card { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06); }
      .card-header { background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%); padding: 32px 40px; text-align: center; }
      .card-header .logo { font-size: 22px; font-weight: 700; color: #ffffff; letter-spacing: -0.3px; }
      .card-header .logo span { color: #93c5fd; }
      .card-body { padding: 36px 40px; }
      .section-arabic { direction: rtl; text-align: right; font-family: 'Segoe UI', Tahoma, sans-serif; }
      .section-english { direction: ltr; text-align: left; }
      h1 { font-size: 22px; font-weight: 700; color: #111827; margin: 0 0 16px 0; }
      p { margin: 0 0 14px 0; color: #374151; font-size: 15px; }
      .button-wrap { text-align: center; margin: 28px 0; }
      .button { display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%); color: #ffffff; text-decoration: none; padding: 14px 36px; border-radius: 8px; font-weight: 600; font-size: 15px; letter-spacing: 0.3px; }
      .button:hover { background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%); }
      .divider { border: none; height: 1px; background: linear-gradient(to right, transparent, #e5e7eb, transparent); margin: 32px 0; }
      .link-fallback { color: #6b7280; font-size: 12px; word-break: break-all; margin: 16px 0 0 0; }
      .card-footer { background: #f9fafb; padding: 24px 40px; text-align: center; }
      .card-footer p { color: #9ca3af; font-size: 12px; margin: 0 0 4px 0; }
      .card-footer a { color: #6b7280; text-decoration: none; font-size: 12px; }
      .card-footer a:hover { text-decoration: underline; }
      .social-links { margin: 12px 0; }
      .social-links a { display: inline-block; margin: 0 6px; }
      @media only screen and (max-width: 480px) { .card-body { padding: 24px 20px; } .card-header { padding: 24px 20px; } .card-footer { padding: 20px; } }
    </style>
  </head>
  <body>
    <div class="outer">
      <div class="card">
        <div class="card-header">
          <div class="logo">Physio<span>AI</span>.online</div>
        </div>
        <div class="card-body">
          <div class="section-arabic">${arabicBody}</div>
          <hr class="divider">
          <div class="section-english">${englishBody}</div>
        </div>
        <div class="card-footer">
          <p>&copy; ${year} PhysioAI.online. All rights reserved.</p>
          <p>
            <a href="${APP_URL}">${APP_URL}</a> &middot;
            <a href="${APP_URL}/privacy">Privacy</a> &middot;
            <a href="${APP_URL}/terms">Terms</a>
          </p>
        </div>
      </div>
    </div>
  </body>
</html>`;
}

function buildButtonHtml(url: string, label: string): string {
  return `<div class="button-wrap"><a href="${url}" class="button" target="_blank">${label}</a></div>
<p class="link-fallback" style="text-align:center">${url}</p>`;
}

async function sendMailSafely(
  to: string,
  subject: string,
  html: string
): Promise<void> {
  try {
    await transporter.sendMail({ from: FROM, to, subject, html });
  } catch (err) {
    console.error(`[EMAIL] SMTP FAILED — check your .env SMTP_* settings`);
    console.error(`[EMAIL] Error: ${err instanceof Error ? err.message : err}`);
  }
}

const SEP = `\n${'='.repeat(48)}`;

export async function sendVerificationEmail(
  to: string,
  name: string,
  token: string
): Promise<void> {
  const url = `${APP_URL}/verify-email?token=${token}`;
  console.log(`${SEP}\n[EMAIL] Verification link for ${to}:\n${url}\n${SEP}`);

  const arabic = `<h1>تأكيد البريد الإلكتروني</h1>
<p>مرحباً ${name}،</p>
<p>شكراً لتسجيلك في PhysioAI.online! نحن متحمسون لمساعدتك في التحضير لامتحانات العلاج الطبيعي.</p>
<p>يرجى النقر على الزر أدناه لتأكيد بريدك الإلكتروني:</p>
${buildButtonHtml(url, 'تأكيد البريد الإلكتروني')}
<p><strong>ستنتهي صلاحية هذا الرابط خلال 24 ساعة.</strong></p>
<p style="color:#6b7280;font-size:13px;">إذا لم تقم بإنشاء حساب في PhysioAI.online، يمكنك تجاهل هذا البريد الإلكتروني بأمان.</p>`;

  const english = `<h1>Verify Your Email Address</h1>
<p>Hi ${name},</p>
<p>Thank you for registering with PhysioAI.online! We're excited to help you prepare for your physiotherapy exams.</p>
<p>Please click the button below to verify your email address:</p>
${buildButtonHtml(url, 'Verify Email Address')}
<p><strong>This link will expire in 24 hours.</strong></p>
<p style="color:#6b7280;font-size:13px;">If you didn't create an account with PhysioAI.online, you can safely ignore this email.</p>`;

  await sendMailSafely(
    to,
    'تأكيد البريد الإلكتروني | Verify Your Email - PhysioAI.online',
    buildHtml(arabic, english)
  );
}

export async function sendResendVerificationEmail(
  to: string,
  name: string,
  token: string
): Promise<void> {
  const url = `${APP_URL}/verify-email?token=${token}`;
  console.log(`${SEP}\n[EMAIL] Resend verification link for ${to}:\n${url}\n${SEP}`);

  const arabic = `<h1>إعادة إرسال رابط التأكيد</h1>
<p>مرحباً ${name}،</p>
<p>لقد طلبت إعادة إرسال رابط تأكيد البريد الإلكتروني لحسابك في PhysioAI.online.</p>
<p>يرجى النقر على الزر أدناه لتأكيد بريدك الإلكتروني:</p>
${buildButtonHtml(url, 'تأكيد البريد الإلكتروني')}
<p><strong>ستنتهي صلاحية هذا الرابط خلال 24 ساعة.</strong></p>
<p style="color:#6b7280;font-size:13px;">إذا لم تطلب هذا البريد الإلكتروني، يمكنك تجاهله بأمان.</p>`;

  const english = `<h1>Resend Verification Email</h1>
<p>Hi ${name},</p>
<p>You requested a new verification email for your PhysioAI.online account.</p>
<p>Please click the button below to verify your email address:</p>
${buildButtonHtml(url, 'Verify Email Address')}
<p><strong>This link will expire in 24 hours.</strong></p>
<p style="color:#6b7280;font-size:13px;">If you didn't request this email, you can safely ignore it.</p>`;

  await sendMailSafely(
    to,
    'تأكيد البريد الإلكتروني | Verify Your Email - PhysioAI.online',
    buildHtml(arabic, english)
  );
}

export async function sendPasswordResetEmail(
  to: string,
  name: string,
  token: string
): Promise<void> {
  const url = `${APP_URL}/reset-password?token=${token}`;
  console.log(`${SEP}\n[EMAIL] Password reset link for ${to}:\n${url}\n${SEP}`);

  const arabic = `<h1>إعادة تعيين كلمة المرور</h1>
<p>مرحباً ${name}،</p>
<p>لقد تلقينا طلباً لإعادة تعيين كلمة المرور لحسابك في PhysioAI.online.</p>
<p>انقر على الزر أدناه لإنشاء كلمة مرور جديدة:</p>
${buildButtonHtml(url, 'إعادة تعيين كلمة المرور')}
<p><strong>ستنتهي صلاحية هذا الرابط خلال ساعة واحدة.</strong></p>
<p style="color:#dc2626;font-size:13px;"><strong>تحذير أمني:</strong> إذا لم تطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذا البريد الإلكتروني أو الاتصال بنا إذا كانت لديك مخاوف.</p>`;

  const english = `<h1>Reset Your Password</h1>
<p>Hi ${name},</p>
<p>We received a request to reset your password for your PhysioAI.online account.</p>
<p>Click the button below to create a new password:</p>
${buildButtonHtml(url, 'Reset Password')}
<p><strong>This link will expire in 1 hour.</strong></p>
<p style="color:#dc2626;font-size:13px;"><strong>Security Notice:</strong> If you didn't request a password reset, please ignore this email or contact us if you have concerns.</p>`;

  await sendMailSafely(
    to,
    'إعادة تعيين كلمة المرور | Reset Your Password - PhysioAI.online',
    buildHtml(arabic, english)
  );
}
