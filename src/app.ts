import swagger from '@fastify/swagger';
import swagger_ui from '@fastify/swagger-ui';
import Fastify from 'fastify';

import * as config from './config';
import registerRoutes from './routes';

// Init app
const app = Fastify({ logger: true });

// Register Swagger
app.register(swagger, config.swaggerConfig);
app.register(swagger_ui, {
  routePrefix: '/api/docs',
  uiConfig: {
    docExpansion: 'full',
    deepLinking: false,
  },
});

// Register Routes
registerRoutes(app);

export default app;
