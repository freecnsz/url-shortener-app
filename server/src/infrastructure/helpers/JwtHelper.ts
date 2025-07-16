import jwt from 'jsonwebtoken';
import { IJwtHelper } from '../../domain/interfaces/helpers/IJwtHelper';
import { InvalidTokenError, TokenExpiredError } from '../../domain/errors';

export class JwtHelper implements IJwtHelper {
  private readonly secretKey: string;
  private readonly expiresIn: string;

  constructor() {
    this.secretKey = process.env.JWT_SECRET || 'your-secret-key';
    this.expiresIn = process.env.JWT_EXPIRES_IN || '24h';
  }

  generateToken(payload: object): string {
    return jwt.sign(payload, this.secretKey, {
      expiresIn: this.expiresIn
    });
  }

  verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.secretKey);
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        throw new TokenExpiredError();
      }
      throw new InvalidTokenError();
    }
  }

  generateRefreshToken(payload: object): string {
    return jwt.sign(payload, this.secretKey, {
      expiresIn: '7d'
    });
  }
}