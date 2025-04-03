import { TokenOption } from '@app/schemas/jwt.schemas';

import * as envConfig from './env.config';

export const emailConfig = {
  options: {
    host: envConfig.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(envConfig.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: envConfig.SMTP_USER,
      pass: envConfig.SMTP_PASS,
    },
  },
  verificationUrl: `${envConfig.HOST}${envConfig.VERIFICATION_URL}` || 'http://localhost:3000/api/auth/verify-email',
  resetPasswordUrl:
    `${envConfig.HOST}${envConfig.RESETPASSWORD_URL}` || 'http://localhost:3000/api/auth/reset-password',
  fromEmail: envConfig.SMTP_USER,
};

export const emailTokenOption: TokenOption = {
  expiresIn: '24h',
};

export const resetPasswordTokenOption: TokenOption = {
  expiresIn: '2h',
};
