import { User } from '../../entities/User';

// This interface defines the methods for user repository operations.
export interface IUserRepository {
  findById(id: number): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  create(user: User): Promise<void>;
}
