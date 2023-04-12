import jwt from "jsonwebtoken";

const JWTPrivateKey = process.env.JWTKEY;

export const getJWT = (payload) => {
  console.log(`Generating JWT for payload ${JSON.stringify(payload)}`);
  return jwt.sign(payload, JWTPrivateKey, {
    expiresIn: "15m",
  });
};
