import Token from "../../models/auth/token.model.js";

class TokenRepository {
  async create(tokenData) {
    return await Token.create(tokenData);
  }

  async findValidToken(email, token, purpose) {
    return await Token.findOne({
      email: email.toLowerCase().trim(),
      token,
      purpose,
      expires_at: { $gt: new Date() },
    }).exec();
  }

  async deleteToken(id) {
    return await Token.findByIdAndDelete(id).exec();
  }

  async deleteByEmailAndPurpose(email, purpose) {
    return await Token.deleteMany({
      email: email.toLowerCase().trim(),
      purpose,
    }).exec();
  }
}

export default new TokenRepository();
