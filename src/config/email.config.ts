import { tokenOption } from '@app/schemas/jwt.schemas';

import * as envConfig from './env.config';

export const emailConfig = {
  host: envConfig.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(envConfig.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: envConfig.SMTP_USER,
    pass: envConfig.SMTP_PASS,
  },
  verificationUrl: envConfig.VERIFICATION_URL || 'http://localhost:3000/api/auth/verify-email',
  fromEmail: envConfig.SMTP_USER,
};

export const emailTokenOption: tokenOption = {
  expiresIn: '24h',
};
