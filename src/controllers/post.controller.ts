import { FastifyRequest, FastifyReply } from 'fastify';

import { ErrorCodes } from '@app/config';
import { binding } from '@app/decorator/binding.decorator';
import { CreatePostType, PostListResponseType, PostQueryType, PostResponseType } from '@app/schemas/post.schemas';
import { ReqParamsType } from '@app/schemas/request.schema';
import { ErrorResponseType, SuccessResponseType, SuccessResWithoutDataType } from '@app/schemas/response.schemas';
import CategoryService from '@app/services/category.service';
import MediaService from '@app/services/media.service';
import PostService from '@app/services/post.service';
import PostMediaService from '@app/services/postMedia.service';

export default class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly mediaService: MediaService,
    private readonly postMediaService: PostMediaService,
    private readonly cateService: CategoryService
  ) {}

  @binding
  async create(request: FastifyRequest<{ Body: CreatePostType }>, reply: FastifyReply) {
    try {
      const user = request.decodeAccessToken;

      // Create post
      await this.postService.create(request.body, user.userId);

      const res: SuccessResWithoutDataType = {
        code: 201,
        status: 'Success',
      };
      reply.Created(res);
    } catch (err) {
      reply.status(500).send({ error: err.message });
    }
  }

  @binding
  async index(request: FastifyRequest<{ Querystring: PostQueryType }>, reply: FastifyReply) {
    try {
      const { categoryId } = request.query;

      // Verify Cate
      if (categoryId) {
        const isExistingCate = await this.cateService.show(categoryId);

        if (!isExistingCate) {
          const errRes: ErrorResponseType = {
            message: 'Category is not existing',
            code: ErrorCodes.CATE_NOT_FOUND,
          };

          return reply.NotFound(errRes);
        }
      }

      const posts: PostListResponseType = await this.postService.getPosts(request.query);

      const res: SuccessResponseType<PostListResponseType> = {
        code: 200,
        data: posts,
      };

      return reply.OK(res);
    } catch (error) {
      reply.InternalServer(error);
    }
  }

  @binding
  async show(request: FastifyRequest<{ Params: ReqParamsType }>, reply: FastifyReply) {
    try {
      const { id } = request.params;
      const post = await this.postService.getPostByid(id);

      if (!post) {
        const errRes: ErrorResponseType = {
          code: ErrorCodes.POST_NOT_FOUND,
          message: 'Post not found',
        };

        return reply.NotFound(errRes);
      }

      const res: PostResponseType = {
        status: 'success',
        data: post,
        code: 200,
      };
      return reply.OK(res);
    } catch (error) {
      return reply.status(500).send({ error: error.message });
    }
  }
}
