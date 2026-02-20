import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ItemsService } from './items.service';
import { PrismaService } from '../../prisma/prisma.service';


describe('ItemsService', () => {
  let service: ItemsService;
  let prisma: jest.Mocked<PrismaService> & { item: any };

  beforeEach(async () => {
    const prismaMock: Partial<jest.Mocked<PrismaService>> & { item: any } = {
      item: {
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ItemsService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<ItemsService>(ItemsService);
    prisma = module.get(PrismaService) as any;
  });

  describe('list', () => {
    it('should return items with categories included', async () => {
      const items = [
        { id: 1, name: 'Item A', category: { id: 10, name: 'Cat' } },
        { id: 2, name: 'Item B', category: { id: 11, name: 'Cat2' } },
      ];
      prisma.item.findMany.mockResolvedValueOnce(items);

      const result = await service.list();

      expect(prisma.item.findMany).toHaveBeenCalledWith({ include: { category: true } });
      expect(result).toEqual(items);
    });

    it('should handle empty list correctly', async () => {
      prisma.item.findMany.mockResolvedValueOnce([]);

      const result = await service.list();

      expect(result).toEqual([]);
      expect(prisma.item.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('create', () => {
    it('should create an item passing through all provided fields', async () => {
      const data = {
        name: 'New Item',
        sku: 'SKU-1',
        barcode: '1234567890',
        categoryId: 5,
        unit: 'pcs',
        minStock: 10,
      };
      const created = { id: 1, ...data } as any;
      prisma.item.create.mockResolvedValueOnce(created);

      const result = await service.create(data);

      expect(prisma.item.create).toHaveBeenCalledWith({ data: { ...data } });
      expect(result).toEqual(created);
    });
  });

  describe('update', () => {
    it('should update an item by id with provided data', async () => {
      const id = 42;
      const data = { name: 'Updated', minStock: 3 } as any;
      const updated = { id, ...data } as any;
      prisma.item.update.mockResolvedValueOnce(updated);

      const result = await service.update(id, data);

      expect(prisma.item.update).toHaveBeenCalledWith({ where: { id }, data });
      expect(result).toEqual(updated);
    });
  });

  describe('remove', () => {
    it('should remove an item by id when it exists', async () => {
      const id = 7;
      const removed = { id } as any;
      prisma.item.delete.mockResolvedValueOnce(removed);

      const result = await service.remove(id);

      expect(prisma.item.delete).toHaveBeenCalledWith({ where: { id } });
      expect(result).toEqual(removed);
    });

    it('should throw NotFoundException when item does not exist', async () => {
      const id = 999;
      prisma.item.delete.mockRejectedValueOnce(new Error('Record to delete does not exist.'));

      await expect(service.remove(id)).rejects.toBeInstanceOf(NotFoundException);
      await expect(service.remove(id)).rejects.toThrow('Item not found');
    });
  });
});
