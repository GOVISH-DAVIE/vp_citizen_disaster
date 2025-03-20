import dotenv from 'dotenv';
dotenv.config();

export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'your-secret-key',
  expiresIn: '24h',
  issuer: 'citizen-app',
  audience: 'citizen-users',
}; 