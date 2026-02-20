import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, limit = 10, search = '') {
    const skip = (page - 1) * limit;
    const where = search ? { name: { contains: search, mode: 'insensitive' as const } } : {};
    
    const [data, total] = await Promise.all([
      this.prisma.category.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.category.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  async findOne(id: number) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async create(data: { name: string }) {
    const existing = await this.prisma.category.findUnique({ where: { name: data.name } });
    if (existing) {
      throw new ConflictException('Category name already exists');
    }
    return this.prisma.category.create({ data });
  }

  async update(id: number, data: { name: string }) {
    await this.findOne(id);
    const existing = await this.prisma.category.findUnique({ where: { name: data.name } });
    if (existing && existing.id !== id) {
      throw new ConflictException('Category name already exists');
    }
    return this.prisma.category.update({ where: { id }, data });
  }

  async delete(id: number) {
    // First check if category exists
    await this.findOne(id);
    
    // Check if there are any items in this category
    const items = await this.prisma.item.findMany({
      where: { categoryId: id },
    });
    
    // Remove category reference from items first
    if (items.length > 0) {
      await this.prisma.item.updateMany({
        where: { categoryId: id },
        data: { categoryId: null },
      });
    }
    
    // Now delete the category
    await this.prisma.category.delete({ where: { id } });
  }
}
