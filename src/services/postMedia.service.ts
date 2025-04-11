import { PrismaClient } from '@prisma/client';

export default class PostMediaService {
  private readonly _prisma: PrismaClient;
  constructor() {
    this._prisma = new PrismaClient();
  }

  async create(post_id: string, media_id: string) {
    try {
      return await this._prisma.postMedia.create({
        data: {
          postId: post_id,
          mediaId: media_id,
        },
      });
    } catch (error) {
      throw new Error(`Create Post-Media error: ${error.message}`);
    }
  }
}
