import app from './app';

const start = async () => {
  try {
    await app.listen({ port: 3000, host: '0.0.0.0' });
    console.log('Server is running on http://0.0.0.0:3000');
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

start();
