import { PrismaClient } from "@prisma/client";
import { Url } from "../../domain/entities/Url";
import { IUrlRepository } from "../../domain/interfaces/repositories/IUrlRepository";
import { mapPrismaToUrl, mapUrlToPrisma } from "../mappers/UrlPrismaMapper";
import { ClickLog } from "../../domain/entities/ClickLog";
import { mapClickLogToPrisma, mapPrismaToClickLog } from "../mappers/ClickLogPrismaMapper";

export class PrismaUrlRepository implements IUrlRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByCustomAliasAsync(customAlias: string): Promise<Url | null> {
    const url = await this.prisma.url.findUnique({
      where: { customAlias },
    });
    return url ? mapPrismaToUrl(url) : null;
  }

  async findByShortCodeAsync(shortCode: string): Promise<Url | null> {
    const url = await this.prisma.url.findUnique({
      where: { shortCode },
    });
    return url ? mapPrismaToUrl(url) : null;
  }

  async createAsync(url: Url): Promise<Url> {
    const data = mapUrlToPrisma(url);
    const created = await this.prisma.url.create({ data });
    return mapPrismaToUrl(created);
  }

  async updateAsync(url: Url): Promise<Url> {
    const data = mapUrlToPrisma(url);
    const updated = await this.prisma.url.update({
      where: { id: url.id },
      data,
    });
    return mapPrismaToUrl(updated);
  }

  async deleteAsync(id: string): Promise<void> {
    await this.prisma.url.delete({ where: { id } });
  }

  async createClickLogAsync(clickLog: ClickLog): Promise<ClickLog> {
    const data = mapClickLogToPrisma(clickLog);
    const created = await this.prisma.clickLog.create({ data });
    return mapPrismaToClickLog(created);
  }

  async findClickLogsByUrlId(urlId: string): Promise<ClickLog[]> {
    const clickLogs = await this.prisma.clickLog.findMany({
      where: { urlId },
    });
    return clickLogs.map(mapPrismaToClickLog);
  }
}
