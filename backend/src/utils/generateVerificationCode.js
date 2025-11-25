import crypto from "crypto";
export default function generateVerificationCode() {
  return crypto.randomInt(100000, 999999).toString();
}
