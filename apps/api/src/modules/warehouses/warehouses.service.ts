import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WarehousesService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, limit = 10, search = '') {
    const skip = (page - 1) * limit;
    const where = search
      ? { name: { contains: search, mode: 'insensitive' as const } }
      : {};
    
    const [data, total] = await Promise.all([
      this.prisma.warehouse.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.warehouse.count({ where }),
    ]);
    
    return { data, total, page, limit };
  }

  async findOne(id: number) {
    const warehouse = await this.prisma.warehouse.findUnique({ where: { id } });
    if (!warehouse) throw new NotFoundException('Warehouse not found');
    return warehouse;
  }

  async create(data: { name: string; location: string }) {
    const existing = await this.prisma.warehouse.findUnique({ where: { name: data.name } });
    if (existing) {
      throw new ConflictException('Warehouse name already exists');
    }
    return this.prisma.warehouse.create({ data });
  }

  async update(id: number, data: { name?: string; location?: string }) {
    await this.findOne(id);
    if (data.name) {
      const existing = await this.prisma.warehouse.findUnique({ where: { name: data.name } });
      if (existing && existing.id !== id) {
        throw new ConflictException('Warehouse name already exists');
      }
    }
    return this.prisma.warehouse.update({ where: { id }, data });
  }

  async delete(id: number) {
    // First check if warehouse exists
    await this.findOne(id);
    
    // Check if there are any stocks in this warehouse
    const stocks = await this.prisma.stock.findMany({
      where: { warehouseId: id },
    });
    
    // Delete all stocks in this warehouse first
    if (stocks.length > 0) {
      await this.prisma.stock.deleteMany({
        where: { warehouseId: id },
      });
    }
    
    // Now delete the warehouse
    await this.prisma.warehouse.delete({ where: { id } });
  }
}
