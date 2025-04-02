import app from './app';
import * as config from './config';

const PORT = config.PORT || 3000;
const server = app;

const start = async () => {
  try {
    await server.listen({ port: PORT, host: '0.0.0.0' });

    console.log(`Server is running on http://0.0.0.0:${PORT}`);
    console.log(`Swagger UI available at http://localhost:${PORT}/docs`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

start();
