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
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
      .container { background-color: #f9fafb; border-radius: 8px; padding: 40px; }
      .header { text-align: center; margin-bottom: 30px; }
      .logo { font-size: 24px; font-weight: bold; color: #1f2937; }
      .content { background-color: #ffffff; border-radius: 8px; padding: 30px; margin-bottom: 20px; }
      .section-arabic { direction: rtl; text-align: right; }
      .section-english { direction: ltr; text-align: left; }
      h1 { color: #1f2937; font-size: 24px; margin-bottom: 20px; }
      p { margin-bottom: 16px; }
      .button { display: inline-block; background-color: #3b82f6; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: 600; margin: 20px 0; }
      .button:hover { background-color: #2563eb; }
      .divider { border: none; border-top: 1px solid #e5e7eb; margin: 30px 0; }
      .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
      .link-fallback { color: #6b7280; font-size: 12px; word-break: break-all; margin-top: 20px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header"><div class="logo">PhysioAI.online</div></div>
      <div class="content">
        <div class="section-arabic">${arabicBody}</div>
        <hr class="divider">
        <div class="section-english">${englishBody}</div>
      </div>
      <div class="footer">
        <p>&copy; ${year} PhysioAI.online</p>
      </div>
    </div>
  </body>
</html>`;
}

function buildButtonHtml(url: string, label: string): string {
  return `<center><a href="${url}" class="button" target="_blank">${label}</a></center>
<p class="link-fallback">${url}</p>`;
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
<p>إذا لم تقم بإنشاء حساب في PhysioAI.online، يمكنك تجاهل هذا البريد الإلكتروني بأمان.</p>`;

  const english = `<h1>Verify Your Email Address</h1>
<p>Hi ${name},</p>
<p>Thank you for registering with PhysioAI.online! We're excited to help you prepare for your physiotherapy exams.</p>
<p>Please click the button below to verify your email address:</p>
${buildButtonHtml(url, 'Verify Email Address')}
<p><strong>This link will expire in 24 hours.</strong></p>
<p>If you didn't create an account with PhysioAI.online, you can safely ignore this email.</p>`;

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
<p>إذا لم تطلب هذا البريد الإلكتروني، يمكنك تجاهله بأمان.</p>`;

  const english = `<h1>Resend Verification Email</h1>
<p>Hi ${name},</p>
<p>You requested a new verification email for your PhysioAI.online account.</p>
<p>Please click the button below to verify your email address:</p>
${buildButtonHtml(url, 'Verify Email Address')}
<p><strong>This link will expire in 24 hours.</strong></p>
<p>If you didn't request this email, you can safely ignore it.</p>`;

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
<p><strong>تحذير أمني:</strong> إذا لم تطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذا البريد الإلكتروني أو الاتصال بنا إذا كانت لديك مخاوف.</p>`;

  const english = `<h1>Reset Your Password</h1>
<p>Hi ${name},</p>
<p>We received a request to reset your password for your PhysioAI.online account.</p>
<p>Click the button below to create a new password:</p>
${buildButtonHtml(url, 'Reset Password')}
<p><strong>This link will expire in 1 hour.</strong></p>
<p><strong>Security Notice:</strong> If you didn't request a password reset, please ignore this email or contact us if you have concerns.</p>`;

  await sendMailSafely(
    to,
    'إعادة تعيين كلمة المرور | Reset Your Password - PhysioAI.online',
    buildHtml(arabic, english)
  );
}
