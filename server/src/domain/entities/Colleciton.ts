export class Collection {
  constructor(
    public readonly id: number,
    public userId: number,
    public name: string,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}
}
