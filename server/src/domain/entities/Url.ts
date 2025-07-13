export class Url {
  constructor(
    public readonly id: number,
    public originalUrl: string,
    public shortCode: string,
    public userId: number,
    public customPrefix?: string,
    public qrCodeUrl?: string,
    public name?: string,
    public displayText?: string,
    public collectionId?: number,
    public clickCount: number = 0,
    public lastClickedAt?: Date,
    public expiresAt?: Date,
    public createdAt: Date = new Date()
  ) {}
}
