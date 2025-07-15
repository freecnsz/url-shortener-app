import bcrypt from "bcrypt";
import { IPasswordHasher } from "../domain/interfaces/helpers/IPasswordHasher";

export class bcryptHasher implements IPasswordHasher {
  private readonly saltRounds = 10;

  async hash(password: string): Promise<string> {
    return await bcrypt.hash(password, this.saltRounds);
  }

  async compare(plain: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(plain, hash);
  }
}
