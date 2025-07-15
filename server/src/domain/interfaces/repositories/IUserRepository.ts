import { User } from "../../entities/User";

export interface IUserRepository {
  findByEmailAsync(email: string): Promise<User | null>;
  findByUsernameAsync(username: string): Promise<User | null>;
  createAsync(user: User): Promise<User>;
}
