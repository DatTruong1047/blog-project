import { FastifyReply, FastifyRequest } from 'fastify';

import { ErrorCodes } from '@app/config';
import { binding } from '@app/decorator/binding.decorator';
import {
  CategoryArrType,
  CategoryParamsType,
  CategoryQueryType,
  CategoryResponseType,
  UpSertCateType,
} from '@app/schemas/category.schemas';
import { ErrorResponseType, SuccessResponseType, SuccessResWithoutDataType } from '@app/schemas/response.schemas';
import CategoryService from '@app/services/category.service';

export default class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @binding
  async show(request: FastifyRequest<{ Params: CategoryParamsType }>, reply: FastifyReply) {
    try {
      const cate: CategoryResponseType = await this.categoryService.show(request.params.id);

      if (!cate) {
        const resErr: ErrorResponseType = {
          code: ErrorCodes.CATE_NOT_FOUND,
          message: 'Category not found',
        };

        return reply.NotFound(resErr);
      }

      const res: SuccessResponseType<CategoryResponseType> = {
        code: 200,
        data: cate,
      };

      return reply.OK(res);
    } catch (error) {
      return reply.InternalServer(error);
    }
  }

  @binding
  async index(request: FastifyRequest<{ Querystring: CategoryQueryType }>, reply: FastifyReply) {
    try {
      const listCate: CategoryArrType = await this.categoryService.index(request.query);

      const res: SuccessResponseType<CategoryArrType> = {
        code: 200,
        data: listCate,
      };

      reply.OK(res);
    } catch (error) {
      return reply.InternalServer(error);
    }
  }

  @binding
  async create(request: FastifyRequest<{ Body: UpSertCateType }>, reply: FastifyReply) {
    try {
      const existName = await this.categoryService.findByName(request.body.name);

      if (existName) {
        const errRes: ErrorResponseType = {
          code: ErrorCodes.CATE_NAME_IS_EXIST,
          message: 'This name has already been used',
        };

        return reply.BadRequest(errRes);
      }

      await this.categoryService.create(request.body);

      const res: SuccessResWithoutDataType = {
        code: 201,
        status: 'success',
      };
      return reply.Created(res);
    } catch (error) {
      return reply.InternalServer(error);
    }
  }

  @binding
  async edit(request: FastifyRequest<{ Params: CategoryParamsType; Body: UpSertCateType }>, reply: FastifyReply) {
    try {
      const existingCate = await this.categoryService.show(request.params.id);

      if (!existingCate) {
        const errRes: ErrorResponseType = {
          code: ErrorCodes.CATE_NOT_FOUND,
          message: 'Cate not found',
        };

        return reply.NotFound(errRes);
      }

      // Existing name
      const existingName = await this.categoryService.findByName(request.body.name);

      if (existingName) {
        const errRes: ErrorResponseType = {
          code: ErrorCodes.CATE_NAME_IS_EXIST,
          message: 'This name has already been used',
        };
        return reply.BadRequest(errRes);
      }

      await this.categoryService.update(request.body, request.params.id);

      const res: SuccessResWithoutDataType = {
        code: 200,
        status: 'success',
      };
      return reply.OK(res);
    } catch (error) {
      return reply.InternalServer(error);
    }
  }

  @binding
  async delete(request: FastifyRequest<{ Params: CategoryParamsType }>, reply: FastifyReply) {
    try {
      await this.categoryService.delete(request.params.id);

      const res: SuccessResWithoutDataType = {
        code: 200,
        status: 'success',
      };
      return reply.OK(res);
    } catch (error) {
      return reply.InternalServer(error);
    }
  }
}
