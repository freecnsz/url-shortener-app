export class ClickLog {
  constructor(
    public readonly id: number,
    public urlId: number,
    public clickedAt: Date = new Date(),
    public ipAddress?: string,
    public userAgent?: string,
    public referrer?: string
  ) {}
}
