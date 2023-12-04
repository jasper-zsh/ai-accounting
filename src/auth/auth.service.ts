import { PrismaService } from '@/prisma.service';
import { ConflictException, Injectable } from '@nestjs/common';
import { Credential, User } from '@prisma/client';
import { CredentialType } from './auth.enum';
import * as bcrypt from 'bcrypt';

export type CredentialValidator = (
  prisma: PrismaService,
  type: string,
  data: string,
) => Promise<void>;

const validators: Map<string, CredentialValidator> = new Map();
validators.set(
  CredentialType.USERNAME,
  async (prisma: PrismaService, type: string, data: string) => {
    const res = await prisma.credential.findFirst({
      where: {
        type,
        data,
      },
    });
    if (res) {
      throw new ConflictException('User exists');
    }
  },
);

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async createUser(
    credentials: { type: string; data: string }[],
  ): Promise<User> {
    return await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {},
      });
      for (const c of credentials) {
        const validator = validators.get(c.type);
        if (validator) {
          await validator(this.prisma, c.type, c.data);
        }
        await tx.credential.create({
          data: {
            userId: user.id,
            ...c,
          },
        });
      }
      return user;
    });
  }

  async addCredential(
    user: User,
    type: string,
    data: string,
  ): Promise<Credential> {
    const validator = validators.get(type);
    if (validator) {
      await validator(this.prisma, type, data);
    }
    return await this.prisma.credential.create({
      data: {
        userId: user.id,
        type,
        data,
      },
    });
  }

  async authByPassword(
    type: string,
    data: string,
    password: string,
  ): Promise<User | undefined> {
    const mainCred = await this.prisma.credential.findFirst({
      where: {
        type,
        data,
      },
      include: {
        user: true,
      },
    });
    if (!mainCred) {
      return undefined;
    }
    const pwdCred = await this.prisma.credential.findFirst({
      where: {
        userId: mainCred.userId,
        type: CredentialType.PASSWORD,
      },
    });
    if (!pwdCred) {
      return undefined;
    }
    if (mainCred.user.id !== pwdCred.userId) {
      return undefined;
    }
    if (!(await bcrypt.compare(password, pwdCred.data))) {
      return undefined;
    }
    return mainCred.user;
  }
}
