import { Prisma, PrismaClient } from '@prisma/client';

import { ErrorCodes } from '@app/config';
import { CreatePostType, MyPostQueryType, PostQueryType, UpdatePostType } from '@app/schemas/post.schemas';

export default class PostService {
  private readonly _prisma: PrismaClient;
  constructor() {
    this._prisma = new PrismaClient();
  }

  async getMyPosts(query: MyPostQueryType, userId: string | undefined) {
    const whereClause: Prisma.PostWhereInput = {
      authorId: userId,
      ...(query.status && { status: query.status }),
      ...(query.categoryId && { categoryId: query.categoryId }),
      ...this.buildFullTextSearchQuery(query.searchTerm),
    };

    return this.getPaginatedPost(whereClause, query);
  }

  async getPosts(query: PostQueryType) {
    const whereClause: Prisma.PostWhereInput = {
      status: 'PUBLIC',
      ...(query.authorId && { authorId: query.authorId }),
      ...(query.categoryId && { categoryId: query.categoryId }),
      ...this.buildFullTextSearchQuery(query.searchTerm),
    };

    return this.getPaginatedPost(whereClause, query);
  }

  async getPostByid(id: string) {
    try {
      const post = await this._prisma.post.findFirst({
        where: { id },
        include: {
          author: {
            select: {
              id: true,
              firstname: true,
              lastname: true,
              email: true,
              media: true,
            },
          },
          category: true,
        },
      });
      return post;
    } catch (error) {
      throw error;
    }
  }

  async create(input: CreatePostType, authorId: string) {
    const { mediaIds, categoryId, ...data } = input;
    let existingMediaIds: string[] = [];

    if (mediaIds && mediaIds.length > 0) {
      existingMediaIds = await this.validateMedias(mediaIds);
    }

    const postData = {
      title: data.title,
      content: data.content,
      status: data.status,
      author: {
        connect: {
          id: authorId,
        },
      },
      ...(categoryId && { category: { connect: { id: categoryId } } }),
    };

    return await this._prisma.post.create({
      data: {
        ...postData,
        PostMedia: existingMediaIds.length
          ? {
              create: existingMediaIds.map((mediaId) => ({
                media: {
                  connect: { id: mediaId },
                },
              })),
            }
          : undefined,
      },
      include: {
        PostMedia: true,
      },
    });
  }

  async update(
    input: UpdatePostType,
    postId: string,
    authorId: string
  ): Promise<{ success: boolean; code: number; message?: string }> {
    try {
      const { mediaIds, ...data } = input;
      let existingMediaIds: string[] = [];

      if (mediaIds && mediaIds.length > 0) {
        existingMediaIds = await this.validateMedias(mediaIds);
      }

      const existingPost = await this._prisma.post.findFirst({
        where: {
          id: postId,
          authorId,
        },
      });

      if (!existingPost) {
        return {
          success: false,
          code: ErrorCodes.POST_NOT_FOUND,
          message: 'Post not found',
        };
      }

      await this._prisma.postMedia.deleteMany({
        where: { postId },
      });

      await this._prisma.post.update({
        where: {
          id: postId,
        },
        data: {
          ...data,
          PostMedia: existingMediaIds.length
            ? {
                create: existingMediaIds.map((mediaId) => ({
                  media: {
                    connect: { id: mediaId },
                  },
                })),
              }
            : undefined,
        },
      });

      return {
        success: true,
        code: 200,
      };
    } catch (error) {
      return {
        success: false,
        code: ErrorCodes.UPDATE_POST_ERROR,
        message: 'Update post error',
      };
    }
  }

  async delete(postId: string, authorId: string): Promise<{ success: boolean; code: number; message?: string }> {
    try {
      await this._prisma.post.delete({
        where: { id: postId, authorId },
      });
      return {
        success: true,
        code: 200,
      };
    } catch (error) {
      return {
        success: false,
        code: ErrorCodes.DELETE_POST_ERROR,
        message: 'Update post error',
      };
    }
  }

  private async totalPosts(whereClause: Prisma.PostWhereInput) {
    return await this._prisma.post.count({
      where: whereClause,
    });
  }

  private async getPaginatedPost(whereClause: Prisma.PostWhereInput, query: MyPostQueryType | PostQueryType) {
    const posts = await this._prisma.post.findMany({
      where: whereClause,
      include: {
        author: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
            email: true,
            media: true,
          },
        },
        category: true,
      },
      skip: query.skip,
      take: query.take,
      orderBy: { [query.sortBy]: query.sortOrderBy },
    });

    const totalPosts = await this.totalPosts(whereClause);
    const totalPages = Math.ceil(totalPosts / query.take);
    const page = query.skip + 1;
    const hasNextPage = page < totalPages;
    const hasPrevPage = query.skip > 0;

    return {
      posts,
      pagination: {
        totalPosts,
        totalPages,
        page,
        hasNextPage,
        hasPrevPage,
      },
    };
  }

  private buildFullTextSearchQuery(searchTerm?: string) {
    if (!searchTerm || searchTerm.trim() === '') {
      return {};
    }

    return {
      OR: [
        {
          title: {
            contains: searchTerm,
            mode: Prisma.QueryMode.insensitive,
          },
        },
        {
          content: {
            contains: searchTerm,
            mode: Prisma.QueryMode.insensitive,
          },
        },
      ],
    };
  }

  private async validateMedias(mediaIds: string[]) {
    let existingMediaIds: string[] = [];

    const existingMedia = await this._prisma.media.findMany({
      where: {
        id: { in: mediaIds },
      },
      select: { id: true },
    });

    existingMediaIds = existingMedia.map((m) => m.id);

    const invalidMediaIds = mediaIds.filter((id) => !existingMediaIds.includes(id));

    if (invalidMediaIds.length > 0) {
      throw new Error(`Invalid media IDs: ${invalidMediaIds.join(', ')}`);
    }

    return existingMediaIds;
  }
}
