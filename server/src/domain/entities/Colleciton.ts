import { Url } from "url";
import { User } from "./User";

export class Collection {
  constructor(
    public readonly id: string,
    public userId: string,
    public name: string,
    public description?: string,
    public isPublic: boolean = false,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
    
    // Navigation Properties
    public user?: User,
    public urls?: Url[]
  ) {}
}