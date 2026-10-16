import generateVerificationCode from "../../utils/generateVerificationCode.js";
import tokenRepository from "../../repositories/auth/token.repository.js";

async function generateVerificationToken(email, purpose) {
  try {
    const verificationToken = generateVerificationCode();
    await tokenRepository.create({
      email,
      token: verificationToken,
      purpose,
      expires_at: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes expiry
    });
    return verificationToken;
  } catch (error) {
    throw error;
  }
}

export default generateVerificationToken;
