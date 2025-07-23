import {User as PrismaUser } from "@prisma/client";
import { User } from "../../domain/entities/User";
import { AuthProvider } from "../../domain/enums/AuthProvider";

export function mapPrismaUserToEntity(data: PrismaUser): User {
  return new User(
    data.id,
    data.username,
    data.email,
    data.passwordHash ?? undefined,
    data.provider as AuthProvider,
    data.providerId ?? undefined,
    data.firstName ?? undefined,
    data.lastName ?? undefined,
    data.profilePictureUrl ?? undefined,
    data.bio ?? undefined,
    data.isEmailVerified,
    data.emailVerificationToken ?? undefined,
    data.emailVerificationExpiresAt ? new Date(data.emailVerificationExpiresAt) : undefined,
    data.isActive,
    data.lastLoginAt ? new Date(data.lastLoginAt) : undefined,
    data.passwordResetToken ?? undefined,
    data.passwordResetExpiresAt ? new Date(data.passwordResetExpiresAt) : undefined,
    new Date(data.createdAt),
    new Date(data.updatedAt)
  );
}

export function mapUserEntityToPrisma(
  user: User
): Omit<PrismaUser, "updatedAt"> {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    passwordHash: user.passwordHash ?? null,
    provider: user.provider,
    providerId: user.providerId ?? null,
    firstName: user.firstName ?? null,
    lastName: user.lastName ?? null,
    profilePictureUrl: user.profilePictureUrl ?? null,
    bio: user.bio ?? null,
    isEmailVerified: user.isEmailVerified,
    emailVerificationToken: user.emailVerificationToken ?? null,
    emailVerificationExpiresAt: user.emailVerificationExpiresAt ?? null,
    isActive: user.isActive,
    lastLoginAt: user.lastLoginAt ?? null,
    passwordResetToken: user.passwordResetToken ?? null,
    passwordResetExpiresAt: user.passwordResetExpiresAt ?? null,
    createdAt: user.createdAt,
  };
}
