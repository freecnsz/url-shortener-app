import { PrismaClient } from "@prisma/client";
import { IUserRepository } from "../../domain/interfaces/repositories/IUserRepository";
import { User } from "../../domain/entities/User";
import { mapPrismaUserToEntity, mapUserEntityToPrisma } from "../mappers/UserPrismaMapper";

export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async updateAsync(user: User): Promise<User> {
    const data = mapUserEntityToPrisma(user);
    const data_1 = await this.prisma.user.update({
      where: { id: user.id },
      data,
    });
    return mapPrismaUserToEntity(data_1);
  }

  async findByIdAsync(id: string): Promise<User | null> {
    const data = await this.prisma.user.findUnique({ where: { id } });
    return data ? mapPrismaUserToEntity(data) : null;
  }

  async findByEmailAsync(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return user ? mapPrismaUserToEntity(user) : null;
  }

  async findByUsernameAsync(username: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { username } });
    return user ? mapPrismaUserToEntity(user) : null;
  }

  async createAsync(user: User): Promise<User> {
    const data = mapUserEntityToPrisma(user);
    const created = await this.prisma.user.create({ data });
    return mapPrismaUserToEntity(created);
  }
}
