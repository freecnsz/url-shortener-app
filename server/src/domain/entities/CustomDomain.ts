export class CustomDomain {
  constructor(
    public readonly id: string,
    public userId: string,      
    public domain: string,      
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
  ) {}
}
