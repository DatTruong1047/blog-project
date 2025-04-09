import { PrismaClient } from '@prisma/client';

import { CategoryQueryType, UpSertCateType } from '@app/schemas/category.schemas';

export default class CategoryService {
  private readonly _prisma: PrismaClient;

  constructor() {
    this._prisma = new PrismaClient();
  }

  async show(id: string) {
    return this._prisma.category.findFirst({
      where: { id },
    });
  }

  async index(query: CategoryQueryType) {
    return this._prisma.category.findMany({
      where: query.search ? { name: { contains: query.search } } : undefined,
      skip: query.skip || 0,
      take: query.take || 5,
    });
  }

  async create(input: UpSertCateType) {
    return this._prisma.category.create({
      data: {
        name: input.name,
      },
    });
  }

  async findByName(name: string) {
    return this._prisma.category.findUnique({
      where: { name },
    });
  }

  async update(input: UpSertCateType, id: string) {
    return this._prisma.category.update({
      where: { id },
      data: { name: input.name },
    });
  }

  async delete(id: string) {
    return this._prisma.category.delete({
      where: { id },
    });
  }
}
