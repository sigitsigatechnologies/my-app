import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, limit = 10, search = '') {
    const skip = (page - 1) * limit;
    const where = search
      ? { name: { contains: search, mode: 'insensitive' as const } }
      : {};
    
    const [data, total] = await Promise.all([
      this.prisma.supplier.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.supplier.count({ where }),
    ]);
    
    return { data, total, page, limit };
  }

  async findOne(id: number) {
    const supplier = await this.prisma.supplier.findUnique({ where: { id } });
    if (!supplier) throw new NotFoundException('Supplier not found');
    return supplier;
  }

  async create(data: { name: string; phone?: string; address?: string }) {
    return this.prisma.supplier.create({ data });
  }

  async update(id: number, data: { name?: string; phone?: string; address?: string }) {
    await this.findOne(id);
    return this.prisma.supplier.update({ where: { id }, data });
  }

  async delete(id: number) {
    // First check if supplier exists
    await this.findOne(id);
    
    // Check if there are any stockIns for this supplier
    const stockIns = await this.prisma.stockIn.findMany({
      where: { supplierId: id },
    });
    
    // Delete all related stockIn items first
    for (const stockIn of stockIns) {
      await this.prisma.stockInItem.deleteMany({
        where: { stockInId: stockIn.id },
      });
    }
    
    // Delete all stockIns
    await this.prisma.stockIn.deleteMany({
      where: { supplierId: id },
    });
    
    // Now delete the supplier
    await this.prisma.supplier.delete({ where: { id } });
  }
}
