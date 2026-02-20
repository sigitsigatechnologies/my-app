import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ItemsService {
  constructor(private prisma: PrismaService) {}

  async list(page = 1, limit = 10, search = '') {
    const skip = (page - 1) * limit;
    const where = search 
      ? { 
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { sku: { contains: search, mode: 'insensitive' as const } },
          ]
        } 
      : {};
    
    const [data, total] = await Promise.all([
      this.prisma.item.findMany({
        where,
        skip,
        take: limit,
        include: { category: true },
        orderBy: { name: 'asc' },
      }),
      this.prisma.item.count({ where }),
    ]);
    
    return { data, total, page, limit };
  }

  async create(data: { name: string; sku: string; barcode?: string; categoryId?: number; unit?: string; minStock?: number }) {
    // Check for duplicate SKU
    const existingSku = await this.prisma.item.findUnique({ where: { sku: data.sku } });
    if (existingSku) {
      throw new ConflictException('Item with this SKU already exists');
    }
    
    // Check for duplicate barcode if provided
    if (data.barcode) {
      const existingBarcode = await this.prisma.item.findUnique({ where: { barcode: data.barcode } });
      if (existingBarcode) {
        throw new ConflictException('Item with this barcode already exists');
      }
    }
    
    return this.prisma.item.create({ data });
  }

  async update(id: number, data: any) {
    // Check if item exists
    const existing = await this.prisma.item.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Item not found');
    }
    
    // Check for duplicate SKU if changed
    if (data.sku && data.sku !== existing.sku) {
      const existingSku = await this.prisma.item.findUnique({ where: { sku: data.sku } });
      if (existingSku) {
        throw new ConflictException('Item with this SKU already exists');
      }
    }
    
    // Check for duplicate barcode if changed
    if (data.barcode && data.barcode !== existing.barcode) {
      const existingBarcode = await this.prisma.item.findUnique({ where: { barcode: data.barcode } });
      if (existingBarcode) {
        throw new ConflictException('Item with this barcode already exists');
      }
    }
    
    // Filter out undefined values
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== undefined && v !== '')
    );
    
    return this.prisma.item.update({ where: { id }, data: cleanData });
  }

  async remove(id: number) {
    try {
      return await this.prisma.item.delete({ where: { id } });
    } catch (e) {
      throw new NotFoundException('Item not found');
    }
  }
}
