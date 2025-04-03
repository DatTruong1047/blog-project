import { FastifyInstance } from 'fastify';

import { loginHandler, registerHandler } from '../controllers/auth.controller';
import {
  createUserResponseSchemaJSON,
  createUserSchemaJSON,
  loginResponseSchemaJSON,
  loginSchemaJSON,
} from '../schemas/user.schemas';

async function authRoutes(server: FastifyInstance) {
  // server.get('/refreshToken', {
  //   schema: {
  //     tags: ['Auth'],
  //   },
  // });
  server.post('/signUp', {
    schema: {
      tags: ['Auth'],
      body: createUserSchemaJSON,
      response: {
        201: createUserResponseSchemaJSON,
      },
    },
    handler: registerHandler,
  });

  server.post('/signIn', {
    schema: {
      tags: ['Auth'],
      body: loginSchemaJSON,
      response: {
        200: loginResponseSchemaJSON,
      },
    },
    handler: loginHandler,
  });
}

export default authRoutes;
