import * as dotenv from 'dotenv';

import app from './app';
import * as config from './config';

dotenv.config();

const PORT = config.PORT || 3000;

const start = async () => {
  try {
    await app.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
    console.log(`Swagger UI available at http://localhost:${PORT}/docs`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

start();
