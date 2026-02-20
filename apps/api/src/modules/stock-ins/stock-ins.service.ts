import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class StockInsService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    const [data, total] = await Promise.all([
      this.prisma.stockIn.findMany({
        skip,
        take: limit,
        include: { supplier: true, items: { include: { item: true } } },
        orderBy: { date: 'desc' },
      }),
      this.prisma.stockIn.count(),
    ]);
    
    return { data, total, page, limit };
  }

  async findOne(id: number) {
    const stockIn = await this.prisma.stockIn.findUnique({
      where: { id },
      include: { supplier: true, items: { include: { item: true } } },
    });
    if (!stockIn) throw new NotFoundException('StockIn not found');
    return stockIn;
  }

  async create(data: { supplierId: number; items: { itemId: number; qty: number }[] }) {
    const total = data.items.reduce((sum, item) => sum + item.qty, 0);
    
    const stockIn = await this.prisma.stockIn.create({
      data: {
        supplierId: data.supplierId,
        total,
        items: {
          create: data.items,
        },
      },
      include: { supplier: true, items: { include: { item: true } } },
    });

    // Update stock quantities (default warehouse)
    for (const item of data.items) {
      const existingStock = await this.prisma.stock.findFirst({
        where: { itemId: item.itemId, warehouseId: 1 },
      });
      
      if (existingStock) {
        await this.prisma.stock.update({
          where: { id: existingStock.id },
          data: { quantity: { increment: item.qty } },
        });
      } else {
        await this.prisma.stock.create({
          data: { itemId: item.itemId, warehouseId: 1, quantity: item.qty },
        });
      }
    }

    return stockIn;
  }

  async update(id: number, data: { supplierId?: number; items?: { itemId: number; qty: number }[] }) {
    const existingStockIn = await this.findOne(id);
    
    // If items are being updated, revert old stock and add new
    if (data.items) {
      // Revert old stock quantities
      for (const item of existingStockIn.items) {
        const existingStock = await this.prisma.stock.findFirst({
          where: { itemId: item.itemId, warehouseId: 1 },
        });
        if (existingStock) {
          await this.prisma.stock.update({
            where: { id: existingStock.id },
            data: { quantity: { decrement: item.qty } },
          });
        }
      }
      
      // Add new stock quantities
      for (const item of data.items) {
        const existingStock = await this.prisma.stock.findFirst({
          where: { itemId: item.itemId, warehouseId: 1 },
        });
        
        if (existingStock) {
          await this.prisma.stock.update({
            where: { id: existingStock.id },
            data: { quantity: { increment: item.qty } },
          });
        } else {
          await this.prisma.stock.create({
            data: { itemId: item.itemId, warehouseId: 1, quantity: item.qty },
          });
        }
      }
      
      // Delete old items
      await this.prisma.stockInItem.deleteMany({
        where: { stockInId: id },
      });
      
      // Create new items
      for (const item of data.items) {
        await this.prisma.stockInItem.create({
          data: { stockInId: id, itemId: item.itemId, qty: item.qty },
        });
      }
    }
    
    const total = data.items 
      ? data.items.reduce((sum, item) => sum + item.qty, 0)
      : existingStockIn.total;
    
    return this.prisma.stockIn.update({
      where: { id },
      data: { 
        supplierId: data.supplierId ?? existingStockIn.supplierId,
        total,
      },
      include: { supplier: true, items: { include: { item: true } } },
    });
  }

  async delete(id: number) {
    // First get the stockIn to know what items to revert
    const stockIn = await this.findOne(id);
    
    // Revert stock quantities (default warehouse)
    for (const item of stockIn.items) {
      const existingStock = await this.prisma.stock.findFirst({
        where: { itemId: item.itemId, warehouseId: 1 },
      });
      
      if (existingStock) {
        await this.prisma.stock.update({
          where: { id: existingStock.id },
          data: { quantity: { decrement: item.qty } },
        });
      }
    }
    
    // Delete the stockIn items first (cascade should handle this, but doing explicitly)
    await this.prisma.stockInItem.deleteMany({
      where: { stockInId: id },
    });
    
    // Now delete the stockIn
    await this.prisma.stockIn.delete({ where: { id } });
  }
}
