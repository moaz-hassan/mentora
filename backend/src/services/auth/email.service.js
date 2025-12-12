import { sendMail } from "../../config/mailer.js";

const verificationEmailTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0f172a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0f172a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 400px; background-color: #1e293b; border-radius: 16px; padding: 40px 30px;">
          <tr>
            <td align="center">
              <!-- Logo Circle -->
              <div style="width: 60px; height: 60px; background-color: #1e3a5f; border-radius: 50%; margin-bottom: 20px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 24px;">🎓</span>
              </div>
              
              <!-- Email Icon -->
              <div style="width: 50px; height: 50px; background-color: #1e293b; border: 2px solid #334155; border-radius: 12px; margin-bottom: 24px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 24px;">✉️</span>
              </div>
              
              <!-- Title -->
              <h1 style="color: #ffffff; font-size: 24px; font-weight: 600; margin: 0 0 16px 0;">Verify your email</h1>
              
              <!-- Message -->
              <p style="color: #94a3b8; font-size: 15px; line-height: 1.6; margin: 0 0 8px 0; text-align: center;">
                Thanks for signing up for <strong style="color: #ffffff;">Mentora</strong>!
              </p>
              <p style="color: #94a3b8; font-size: 15px; line-height: 1.6; margin: 0 0 32px 0; text-align: center;">
                We're excited to have you on board.
              </p>
              <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0 0 32px 0; text-align: center;">
                To ensure your account is secure and to get full access to all features, please verify that this is your email address by clicking the button below.
              </p>
              
              <!-- Button -->
              <a href="{{verificationLink}}" style="display: inline-block; background-color: #3b82f6; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 15px; font-weight: 600;">
                Verify Email &rarr;
              </a>
              
              <!-- Expiry Notice -->
              <p style="color: #64748b; font-size: 13px; margin: 20px 0 0 0;">
                Link expires in 24 hours.
              </p>
            </td>
          </tr>
        </table>
        
        <!-- Footer -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 400px; padding: 24px 30px;">
          <tr>
            <td align="center">
              <p style="color: #475569; font-size: 12px; line-height: 1.6; margin: 0 0 16px 0; text-align: center;">
                If you didn't create an account, you can safely ignore this email. Someone might have typed their email address incorrectly.
              </p>
              
              <div style="border-top: 1px solid #334155; padding-top: 20px; margin-top: 8px;">
                <p style="color: #64748b; font-size: 11px; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 0.5px;">Need Help?</p>
                <a href="mailto:support@mentora.app" style="color: #3b82f6; font-size: 13px; text-decoration: none;">Contact Support</a>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

const resetPasswordTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0f172a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0f172a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 400px; background-color: #1e293b; border-radius: 16px; padding: 40px 30px;">
          <tr>
            <td align="center">
              <!-- Logo Circle -->
              <div style="width: 60px; height: 60px; background-color: #1e3a5f; border-radius: 50%; margin-bottom: 20px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 24px;">🎓</span>
              </div>
              
              <!-- Lock Icon -->
              <div style="width: 50px; height: 50px; background-color: #1e293b; border: 2px solid #334155; border-radius: 12px; margin-bottom: 24px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 24px;">🔐</span>
              </div>
              
              <!-- Title -->
              <h1 style="color: #ffffff; font-size: 24px; font-weight: 600; margin: 0 0 16px 0;">Forgot your password?</h1>
              
              <!-- Message -->
              <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0 0 32px 0; text-align: center;">
                We received a request to reset the password for your account. If you made this request, simply click the button below to choose a new password.
              </p>
              
              <!-- Button -->
              <a href="{{resetLink}}" style="display: inline-block; background-color: #3b82f6; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 15px; font-weight: 600;">
                Reset Password
              </a>
              
              <!-- Security Notice -->
              <p style="color: #64748b; font-size: 13px; margin: 24px 0 0 0; text-align: center;">
                If you didn't ask to reset your password, you can safely ignore this email. Your account is secure.
              </p>
            </td>
          </tr>
        </table>
        
        <!-- Alternative Link -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 400px; padding: 24px 30px;">
          <tr>
            <td align="center">
              <p style="color: #64748b; font-size: 11px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.5px;">Or use this link</p>
              <div style="background-color: #1e293b; border-radius: 8px; padding: 12px 16px; word-break: break-all;">
                <a href="{{resetLink}}" style="color: #3b82f6; font-size: 12px; text-decoration: none;">{{resetLink}}</a>
              </div>
            </td>
          </tr>
        </table>
        
        <!-- Footer -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 400px; padding: 16px 30px;">
          <tr>
            <td align="center">
              <p style="color: #475569; font-size: 12px; margin: 0 0 4px 0;">&copy; 2024 Mentora</p>
              <p style="color: #475569; font-size: 11px; margin: 0;">
                <a href="#" style="color: #64748b; text-decoration: none;">Privacy Policy</a>
                &nbsp;&middot;&nbsp;
                <a href="#" style="color: #64748b; text-decoration: none;">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

export const sendVerificationEmail = async (email, token) => {
  const verificationLink = `${process.env.CLIENT_URL}/verify-email?email=${email}&token=${token}`;
  const html = verificationEmailTemplate.replace(/\{\{verificationLink\}\}/g, verificationLink);
  await sendMail(email, "Please verify your email address", html);
};

export const sendPasswordResetEmail = async (email, token) => {
  const resetLink = `${process.env.CLIENT_URL}/reset-password?email=${email}&token=${token}`;
  const html = resetPasswordTemplate.replace(/\{\{resetLink\}\}/g, resetLink);
  await sendMail(email, "Reset your password", html);
};

const giftCourseEmailTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You've Received a Gift!</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0f172a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0f172a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 400px; background-color: #1e293b; border-radius: 16px; padding: 40px 30px;">
          <tr>
            <td align="center">
              <!-- Logo Circle -->
              <div style="width: 60px; height: 60px; background-color: #1e3a5f; border-radius: 50%; margin-bottom: 20px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 24px;">🎓</span>
              </div>
              
              <!-- Gift Icon -->
              <div style="width: 50px; height: 50px; background-color: #1e293b; border: 2px solid #334155; border-radius: 12px; margin-bottom: 24px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 24px;">🎁</span>
              </div>
              
              <!-- Title -->
              <h1 style="color: #ffffff; font-size: 24px; font-weight: 600; margin: 0 0 16px 0;">You've received a gift!</h1>
              
              <!-- Message -->
              <p style="color: #94a3b8; font-size: 15px; line-height: 1.6; margin: 0 0 8px 0; text-align: center;">
                Hey <strong style="color: #ffffff;">{{recipientName}}</strong>!
              </p>
              <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0; text-align: center;">
                <strong style="color: #ffffff;">{{senderName}}</strong> has gifted you a course on Mentora!
              </p>
              
              <!-- Course Card -->
              <div style="background-color: #0f172a; border-radius: 12px; padding: 20px; margin-bottom: 24px; text-align: center;">
                <p style="color: #3b82f6; font-size: 12px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.5px;">Course</p>
                <h2 style="color: #ffffff; font-size: 18px; font-weight: 600; margin: 0 0 8px 0;">{{courseTitle}}</h2>
                <p style="color: #64748b; font-size: 13px; margin: 0;">{{courseDescription}}</p>
              </div>
              
              {{personalMessage}}
              
              <!-- Button -->
              <a href="{{courseLink}}" style="display: inline-block; background-color: #3b82f6; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 15px; font-weight: 600;">
                Start Learning &rarr;
              </a>
              
              <p style="color: #64748b; font-size: 13px; margin: 20px 0 0 0; text-align: center;">
                You've been automatically enrolled. Click above to begin!
              </p>
            </td>
          </tr>
        </table>
        
        <!-- Footer -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 400px; padding: 24px 30px;">
          <tr>
            <td align="center">
              <p style="color: #475569; font-size: 12px; margin: 0 0 4px 0;">&copy; 2024 Mentora</p>
              <p style="color: #475569; font-size: 11px; margin: 0;">Happy Learning!</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

export const sendGiftCourseEmail = async ({
  recipientEmail,
  recipientName,
  senderName,
  courseTitle,
  courseDescription,
  courseId,
  personalMessage = "",
}) => {
  const courseLink = `${process.env.CLIENT_URL}/enrollments`;
  
  let html = giftCourseEmailTemplate
    .replace(/\{\{recipientName\}\}/g, recipientName)
    .replace(/\{\{senderName\}\}/g, senderName)
    .replace("{{courseTitle}}", courseTitle)
    .replace("{{courseDescription}}", courseDescription || "Start your learning journey!")
    .replace("{{courseLink}}", courseLink);
  
  if (personalMessage && personalMessage.trim()) {
    const messageHtml = `
      <div style="background-color: #fef3c7; border-radius: 8px; padding: 16px; margin-bottom: 24px; text-align: center;">
        <p style="color: #92400e; font-size: 12px; margin: 0 0 8px 0;">Message from ${senderName}:</p>
        <p style="color: #78350f; font-size: 14px; font-style: italic; margin: 0;">"${personalMessage}"</p>
      </div>`;
    html = html.replace("{{personalMessage}}", messageHtml);
  } else {
    html = html.replace("{{personalMessage}}", "");
  }
  
  await sendMail(recipientEmail, `🎁 ${senderName} has gifted you a course!`, html);
};
