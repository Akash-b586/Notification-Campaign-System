import { configDotenv } from "dotenv";
import jwt from "jsonwebtoken";
configDotenv();

const JWT_SECRET = process.env.JWT_SECRET as string;

export type JwtPayload = {
  userId: string;
  role?: "ADMIN" | "CREATOR" | "VIEWER" | "CUSTOMER";
};

export const signToken = (payload: JwtPayload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });
  
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
};
