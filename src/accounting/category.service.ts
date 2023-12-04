import { PrismaService } from '@/prisma.service';
import { Injectable } from '@nestjs/common';
import { Category, User } from '@prisma/client';
import { CreateCategoryDTO } from './dto/category.dto';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async createCategory(user: User, dto: CreateCategoryDTO): Promise<Category> {
    return await this.prisma.category.create({
      data: {
        userId: user.id,
        name: dto.name,
      },
    });
  }

  async listCategories(user: User): Promise<Category[]> {
    return await this.prisma.category.findMany({
      where: {
        userId: user.id,
      },
    });
  }

  async deleteCategory(user: User, id: number) {
    await this.prisma.category.delete({
      where: {
        id,
        userId: user.id,
      },
    });
  }
}
