import { SwaggerOptions } from '@fastify/swagger';

// Use for cookie
export const swaggerConfigForCookie: SwaggerOptions = {
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
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'accessToken', // Tên cookie chứa accessToken của bạn
        },
        // BearerAuth: {
        //   type: 'http',
        //   scheme: 'bearer',
        //   bearerFormat: 'JWT',
        // },
      },
    },
    security: [{ cookieAuth: [] }],
    tags: [
      { name: 'Auth', description: 'Endpoints related to Authenticate' },
      { name: 'Category', description: 'Endpoints related to Categories' },
      { name: 'User', description: 'Endpoints related to Users' },
      { name: 'Post', description: 'Endpoints related to Posts' },
      { name: 'Test', description: 'Endpoint to test api' },
    ],
  },
};

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
      { name: 'Test', description: 'Endpoint to test api' },
    ],
  },
};
