import { FastifyInstance, FastifyPluginAsync, FastifyReply } from 'fastify';
import fastifyPlugin from 'fastify-plugin';

import { ErrorResponseType, SuccessResponseType } from '@app/schemas/response.schemas';

const replyPlugin: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.decorateReply('NotFound', function (this: FastifyReply, err: ErrorResponseType) {
    return this.status(404).send(err);
  });

  app.decorateReply('BadRequest', function (this: FastifyReply, err: ErrorResponseType) {
    return this.status(400).send(err);
  });

  app.decorateReply('Unauthorized', function (this: FastifyReply, err: ErrorResponseType) {
    return this.status(401).send(err);
  });

  app.decorateReply('Forbidden', function (this: FastifyReply, err: ErrorResponseType) {
    return this.status(403).send(err);
  });

  app.decorateReply('Conflict', function (this: FastifyReply, err: ErrorResponseType) {
    return this.status(409).send(err);
  });

  app.decorateReply('OK', function <T>(this: FastifyReply, res: SuccessResponseType<T>) {
    return this.status(200).send(res);
  });
  app.decorateReply('Created', function <T>(this: FastifyReply, res: SuccessResponseType<T>) {
    return this.status(201).send(res);
  });
  app.decorateReply('InternalServer', function (this: FastifyReply, err: Error) {
    return this.status(500).send(err);
  });
};

export default fastifyPlugin(replyPlugin);
