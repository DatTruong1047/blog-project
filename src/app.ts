import Fastify from 'fastify';

const app = Fastify({ logger: true });

app.get('/', async () => {
  return { message: 'Sucessful' };
});

export default app;
