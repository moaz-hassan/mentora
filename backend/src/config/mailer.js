import axios from 'axios';
import dotenv from "dotenv";
dotenv.config();

const ELASTIC_EMAIL_API_URL = 'https://api.elasticemail.com/v2/email/send';

export const sendMail = async (to, subject, html) => {
  try {
    const params = new URLSearchParams();
    params.append('apikey', process.env.ELASTIC_EMAIL_API_KEY);
    params.append('from', process.env.EMAIL_FROM || 'moaazhassan643@gmail.com');
    params.append('fromName', 'Mentora');
    params.append('to', to);
    params.append('subject', subject);
    params.append('bodyHtml', html);
    params.append('isTransactional', 'true');

    const response = await axios.post(ELASTIC_EMAIL_API_URL, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (response.data.success) {
      console.log("Email sent successfully to:", to);
      return response.data;
    } else {
      throw new Error(response.data.error || 'Unknown error');
    }
  } catch (err) {
    console.error("Email sending failed:", err.response?.data || err.message);
    throw new Error("Error sending email: " + (err.response?.data?.error || err.message));
  }
};
