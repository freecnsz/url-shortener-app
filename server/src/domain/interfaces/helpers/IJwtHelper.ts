export interface IJwtHelper {
  generateToken(payload: object): string;
  verifyToken(token: string): any;
  generateRefreshToken(payload: object): string;
}