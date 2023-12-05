import { AuthenticatedGuard } from '@/auth/authenticated.guard';
import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDTO } from './dto/category.dto';

@UseGuards(AuthenticatedGuard)
@Controller('categories')
export class CategoryController {
  constructor(private category: CategoryService) {}

  @Post()
  async createCategory(@Request() req, @Body() dto: CreateCategoryDTO) {
    return await this.category.createCategory(req.user, dto);
  }

  @Get()
  async listCategories(@Request() req) {
    return await this.category.listCategories(req.user);
  }
}
