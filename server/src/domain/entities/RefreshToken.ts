export class RefreshToken {
  constructor(
    public readonly id: number,
    public userId: number,
    public token: string,
    public expiresAt: Date,
    public createdAt: Date = new Date(),
    public revokedAt?: Date,
    public replacedByToken?: string
  ) {}
}
