import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { ENV } from '../config/env';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export const generateAccessToken = (payload: TokenPayload): string => {
  const options: SignOptions = { expiresIn: ENV.JWT_ACCESS_EXPIRES_IN as any };
  return jwt.sign(payload, ENV.JWT_ACCESS_SECRET as Secret, options);
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  const options: SignOptions = { expiresIn: ENV.JWT_REFRESH_EXPIRES_IN as any };
  return jwt.sign(payload, ENV.JWT_REFRESH_SECRET as Secret, options);
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, ENV.JWT_ACCESS_SECRET as Secret) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, ENV.JWT_REFRESH_SECRET as Secret) as TokenPayload;
};
