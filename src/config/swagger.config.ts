import { SwaggerOptions } from '@fastify/swagger';
import { jsonSchemaTransform } from 'fastify-type-provider-zod';

// Use for Bearer Token
export const swaggerConfig: SwaggerOptions = {
  openapi: {
    openapi: '3.0.0',
    info: {
      title: 'Blog Project',
      description: 'Fastify API with Swagger',
      version: '1.0.0',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ BearerAuth: [] }],
    tags: [
      { name: 'Auth', description: 'Endpoints related to Authenticate' },
      { name: 'Category', description: 'Endpoints related to Categories' },
      { name: 'User', description: 'Endpoints related to Users' },
      { name: 'Post', description: 'Endpoints related to Posts' },
      { name: 'Media', description: 'Endpoints related to Media' },
      { name: 'Test', description: 'Endpoint to test api' },
    ],
  },
  hideUntagged: true,
  transform: jsonSchemaTransform,
};
