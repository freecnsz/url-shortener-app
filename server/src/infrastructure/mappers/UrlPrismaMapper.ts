import { Url } from "../../domain/entities/Url";
import { Url as PrismaUrl } from "@prisma/client";

export function mapUrlToPrisma(url: Url):
  Omit<PrismaUrl, "updatedAt"> {
  return {
    id: url.id,
    userId: url.userId,
    originalUrl: url.originalUrl,
    shortCode: url.shortCode,
    customAlias: url.customAlias ?? null,
    customDomainId: url.customDomainId ?? null,
    collectionId: url.collectionId ?? null,
    name: url.name ?? null,
    description: url.description ?? null,
    clickCount: url.clickCount,
    lastClickedAt: url.lastClickedAt ?? null,
    expiresAt: url.expiresAt ?? null,
    maxClicks: url.maxClicks ?? null,
    isActive: url.isActive,
    isPasswordProtected: url.isPasswordProtected,
    passwordHash: url.passwordHash ?? null,
    createdAt: url.createdAt
  };
}

export function mapPrismaToUrl(data: PrismaUrl): Url {
  return new Url(
    data.id,
    data.userId,
    data.originalUrl,
    data.shortCode,
    data.customAlias ?? undefined,
    data.customDomainId ?? undefined,
    data.collectionId ?? undefined,
    data.name ?? undefined,
    data.description ?? undefined,
    data.clickCount,
    data.lastClickedAt ? new Date(data.lastClickedAt) : undefined,
    data.expiresAt ? new Date(data.expiresAt) : undefined,
    data.maxClicks ?? undefined,
    data.isActive,
    data.isPasswordProtected,
    data.passwordHash ?? undefined,
    data.createdAt,
    data.updatedAt
  );
}