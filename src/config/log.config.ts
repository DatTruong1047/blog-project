export const logger = {
  level: 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      translateTime: 'SYS:yyyy-MM-dd HH:mm:ss Z',
      ignore: 'pid,hostname',
    },
  },
};
