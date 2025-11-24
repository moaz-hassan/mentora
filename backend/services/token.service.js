import generateVerificationCode from "../utils/generateVerificationCode.js";
import models from "../models/index.model.js";
const { Token } = models;

async function generateVerificationToken(email, purpose) {
  try {
    const verificationToken = generateVerificationCode();
    await Token.create({
      email,
      token: verificationToken,
      purpose,
      expires_at: new Date(Date.now() + 10 * 60 * 1000),
    });
    return verificationToken;
  } catch (error) {
    throw error;
  }
}

export default generateVerificationToken;
