import { PrismaClient } from '@prisma/client';

import { CreateMediaType, UpdateMediaType } from '@app/schemas/media.schemas';

export default class MediaService {
  private readonly _prisma: PrismaClient;

  constructor() {
    this._prisma = new PrismaClient();
  }

  async findByURL(url: string) {
    return this._prisma.media.findUnique({
      where: { url },
    });
  }

  async show(id: string) {
    return this._prisma.media.findFirst({
      where: { id },
    });
  }

  async create(input: CreateMediaType) {
    return this._prisma.media.create({
      data: {
        url: input.url,
        description: input.description,
      },
    });
  }

  async edit(input: UpdateMediaType) {
    return this._prisma.media.update({
      where: { id: input.id },
      data: {
        url: input.url,
        description: input.description,
      },
    });
  }

  async delete(id: string) {
    return this._prisma.media.delete({
      where: { id },
    });
  }

  async upsert(input: CreateMediaType | UpdateMediaType) {
    try {
      if ('id' in input) {
        return this._prisma.media.upsert({
          where: { id: input.id },
          update: {
            url: input.url,
            description: input.description,
          },
          create: {
            url: input.url,
            description: input.description,
          },
        });
      } else {
        return this._prisma.media.create({
          data: {
            url: input.url,
            description: input.description,
          },
        });
      }
    } catch (error) {
      throw error;
    }
  }
}
