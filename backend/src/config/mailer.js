import nodemailer from 'nodemailer';
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, 
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export const sendMail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: `"Mentora" <${process.env.GMAIL_USER}>`,
      to: to,
      subject: subject,
      html: html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully to:", to, "Message ID:", info.messageId);
    return info;
  } catch (err) {
    console.error("Email sending failed:", err.message);
    throw new Error("Error sending email: " + err.message);
  }
};
