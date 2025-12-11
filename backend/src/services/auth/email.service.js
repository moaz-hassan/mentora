import { sendMail } from "../../config/mailer.js";

const resetPasswordTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333333;
      background-color: #f4f4f4;
    }
    .email-wrapper {
      width: 100%;
      background-color: #f4f4f4;
      padding: 40px 20px;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    .email-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 30px;
      text-align: center;
    }
    .email-header h1 {
      color: #ffffff;
      font-size: 28px;
      font-weight: 600;
      margin: 0;
    }
    .email-body {
      padding: 40px 30px;
    }
    .email-body h2 {
      color: #333333;
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 20px;
    }
    .email-body p {
      color: #666666;
      font-size: 16px;
      margin-bottom: 20px;
    }
    .button-container {
      text-align: center;
      margin: 35px 0;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff;
      padding: 16px 40px;
      text-decoration: none;
      border-radius: 6px;
      font-size: 16px;
      font-weight: 600;
      transition: transform 0.2s;
    }
    .button:hover {
      transform: translateY(-2px);
    }
    .info-box {
      background-color: #f8f9fa;
      border-left: 4px solid #667eea;
      padding: 15px 20px;
      margin: 25px 0;
      border-radius: 4px;
    }
    .info-box p {
      margin: 0;
      color: #555555;
      font-size: 14px;
    }
    .email-footer {
      background-color: #f8f9fa;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e0e0e0;
    }
    .email-footer p {
      color: #999999;
      font-size: 14px;
      margin: 5px 0;
    }
    .security-notice {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
    }
    .security-notice p {
      font-size: 14px;
      color: #777777;
    }
    @media only screen and (max-width: 600px) {
      .email-wrapper {
        padding: 20px 10px;
      }
      .email-header {
        padding: 30px 20px;
      }
      .email-header h1 {
        font-size: 24px;
      }
      .email-body {
        padding: 30px 20px;
      }
      .email-body h2 {
        font-size: 20px;
      }
      .button {
        padding: 14px 30px;
        font-size: 15px;
      }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-container">
      <div class="email-header">
        <h1>🔐 Password Reset</h1>
      </div>
      
      <div class="email-body">
        <h2>Reset Your Password</h2>
        <p>Hello,</p>
        <p>We received a request to reset the password for your account. If you made this request, click the button below to create a new password.</p>
        
        <div class="button-container">
          <a href="{{resetLink}}" class="button">Reset Password</a>
        </div>
        
        <div class="info-box">
          <p><strong>⏱️ This link will expire in 10 minutes</strong> for security reasons. If you need a new link, please request another password reset.</p>
        </div>
        
        <div class="security-notice">
          <p><strong>Didn't request this?</strong></p>
          <p>If you didn't ask to reset your password, you can safely ignore this email. Your password will remain unchanged, and your account is secure.</p>
        </div>
      </div>
      
      <div class="email-footer">
        <p><strong>Need help?</strong> Contact our support team</p>
        <p>&copy; 2024 Your Company Name. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>`;

const verificationEmailTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email Address</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333333;
      background-color: #f4f4f4;
    }
    .email-wrapper {
      width: 100%;
      background-color: #f4f4f4;
      padding: 40px 20px;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    .email-header {
      background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
      padding: 40px 30px;
      text-align: center;
    }
    .email-header h1 {
      color: #ffffff;
      font-size: 28px;
      font-weight: 600;
      margin: 0;
    }
    .email-body {
      padding: 40px 30px;
    }
    .email-body h2 {
      color: #333333;
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 20px;
    }
    .email-body p {
      color: #666666;
      font-size: 16px;
      margin-bottom: 20px;
    }
    .button-container {
      text-align: center;
      margin: 35px 0;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
      color: white;
      padding: 16px 40px;
      text-decoration: none;
      border-radius: 6px;
      font-size: 16px;
      font-weight: 600;
      transition: transform 0.2s;
    }
    .button:hover {
      transform: translateY(-2px);
    }
    .welcome-box {
      background-color: #f0fdf4;
      border-left: 4px solid #11998e;
      padding: 20px;
      margin: 25px 0;
      border-radius: 4px;
    }
    .welcome-box h3 {
      color: #065f46;
      font-size: 18px;
      margin-bottom: 10px;
    }
    .welcome-box ul {
      margin-left: 20px;
      color: #047857;
    }
    .welcome-box li {
      margin: 8px 0;
      font-size: 15px;
    }
    .email-footer {
      background-color: #f8f9fa;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e0e0e0;
    }
    .email-footer p {
      color: #999999;
      font-size: 14px;
      margin: 5px 0;
    }
    .alternative-method {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
    }
    .alternative-method p {
      font-size: 14px;
      color: #777777;
    }
    @media only screen and (max-width: 600px) {
      .email-wrapper {
        padding: 20px 10px;
      }
      .email-header {
        padding: 30px 20px;
      }
      .email-header h1 {
        font-size: 24px;
      }
      .email-body {
        padding: 30px 20px;
      }
      .email-body h2 {
        font-size: 20px;
      }
      .button {
        padding: 14px 30px;
        font-size: 15px;
      }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-container">
      <div class="email-header">
        <h1>✉️ Welcome Aboard!</h1>
      </div>
      
      <div class="email-body">
        <h2>Verify Your Email Address</h2>
        <p>Hello,</p>
        <p>Thank you for joining us! We're excited to have you on board. To complete your registration and activate your account, please verify your email address by clicking the button below.</p>
        
        <div class="button-container">
          <a href="{{verificationLink}}" class="button">Verify Email Address</a>
        </div>
        
        <div class="welcome-box">
          <h3>🎉 What's Next?</h3>
          <ul>
            <li>Complete your profile setup</li>
            <li>Explore all available features</li>
            <li>Connect with our community</li>
            <li>Get personalized recommendations</li>
          </ul>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
          <p style="font-size: 14px; color: #777777;"><strong>Didn't create an account?</strong></p>
          <p style="font-size: 14px; color: #777777;">If you didn't register with us, please disregard this email. No account will be created without verification.</p>
        </div>
      </div>
      
      <div class="email-footer">
        <p><strong>Questions?</strong> We're here to help!</p>
        <p>&copy; 2024 Your Company Name. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>`;

export const sendVerificationEmail = async (email, token) => {
  const verificationLink = `${process.env.CLIENT_URL}/verify-email?email=${email}&token=${token}`;
  const html = verificationEmailTemplate.replace("{{verificationLink}}", verificationLink);
  await sendMail(email, "Verify Your Email Address", html);
};

export const sendPasswordResetEmail = async (email, token) => {
  const resetLink = `${process.env.CLIENT_URL}/reset-password?email=${email}&token=${token}`;
  const html = resetPasswordTemplate.replace("{{resetLink}}", resetLink);
  await sendMail(email, "Password Reset Request", html);
};

const giftCourseEmailTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You've Received a Gift!</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333333;
      background-color: #f4f4f4;
    }
    .email-wrapper {
      width: 100%;
      background-color: #f4f4f4;
      padding: 40px 20px;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    .email-header {
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      padding: 40px 30px;
      text-align: center;
    }
    .email-header h1 {
      color: #ffffff;
      font-size: 28px;
      font-weight: 600;
      margin: 0;
    }
    .email-body {
      padding: 40px 30px;
    }
    .email-body h2 {
      color: #333333;
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 20px;
    }
    .email-body p {
      color: #666666;
      font-size: 16px;
      margin-bottom: 20px;
    }
    .course-card {
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 24px;
      margin: 25px 0;
    }
    .course-card h3 {
      color: #1e293b;
      font-size: 20px;
      margin-bottom: 10px;
    }
    .course-card p {
      color: #64748b;
      font-size: 14px;
      margin: 0;
    }
    .message-box {
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 20px;
      margin: 25px 0;
      border-radius: 4px;
    }
    .message-box h4 {
      color: #92400e;
      font-size: 14px;
      margin-bottom: 8px;
    }
    .message-box p {
      color: #78350f;
      font-size: 15px;
      font-style: italic;
      margin: 0;
    }
    .button-container {
      text-align: center;
      margin: 35px 0;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: #ffffff;
      padding: 16px 40px;
      text-decoration: none;
      border-radius: 6px;
      font-size: 16px;
      font-weight: 600;
      transition: transform 0.2s;
    }
    .email-footer {
      background-color: #f8f9fa;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e0e0e0;
    }
    .email-footer p {
      color: #999999;
      font-size: 14px;
      margin: 5px 0;
    }
    @media only screen and (max-width: 600px) {
      .email-wrapper {
        padding: 20px 10px;
      }
      .email-header {
        padding: 30px 20px;
      }
      .email-body {
        padding: 30px 20px;
      }
      .button {
        padding: 14px 30px;
        font-size: 15px;
      }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-container">
      <div class="email-header">
        <h1>🎁 You've Received a Gift!</h1>
      </div>
      
      <div class="email-body">
        <h2>A Course Has Been Gifted to You</h2>
        <p>Hello {{recipientName}},</p>
        <p><strong>{{senderName}}</strong> has gifted you a course! You now have full access to start learning.</p>
        
        <div class="course-card">
          <h3>{{courseTitle}}</h3>
          <p>{{courseDescription}}</p>
        </div>

        {{personalMessage}}
        
        <div class="button-container">
          <a href="{{courseLink}}" class="button">Start Learning</a>
        </div>
        
        <p style="font-size: 14px; color: #777777;">You've been automatically enrolled in this course. Click the button above to begin your learning journey!</p>
      </div>
      
      <div class="email-footer">
        <p><strong>Happy Learning!</strong></p>
        <p>&copy; 2024 Mentora. All rights reserved.</p>
      </div>
    </div>
  </div>
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
    .replace("{{recipientName}}", recipientName)
    .replace("{{senderName}}", senderName)
    .replace("{{courseTitle}}", courseTitle)
    .replace("{{courseDescription}}", courseDescription || "Start your learning journey with this amazing course!")
    .replace("{{courseLink}}", courseLink);
  
  
  if (personalMessage && personalMessage.trim()) {
    const messageHtml = `
        <div class="message-box">
          <h4>Message from ${senderName}:</h4>
          <p>"${personalMessage}"</p>
        </div>`;
    html = html.replace("{{personalMessage}}", messageHtml);
  } else {
    html = html.replace("{{personalMessage}}", "");
  }
  
  await sendMail(recipientEmail, `🎁 ${senderName} has gifted you a course!`, html);
};

