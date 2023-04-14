import crypto from "crypto";

export function encrypt(buffer) {
  const key = crypto.randomBytes(32);
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(buffer);
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return Buffer.concat([key, iv, encrypted]);
}

export function decrypt(buffer) {
  const key = buffer.slice(0, 32);
  const iv = buffer.slice(32, 48);
  const encrypted = buffer.slice(48);
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted;
}
