import * as dotenv from 'dotenv';
dotenv.config();

export const PORT = +process.env.PORT;
export const SECRET_KEY = process.env.SECRET_KEY;
export const COOKIE_SECRET_KEY = process.env.COOKIE_KEY;

export const SMTP_HOST = process.env.SMTP_HOST;
export const SMTP_PORT = process.env.SMTP_PORT;
export const SMTP_USER = process.env.SMTP_USER;
export const SMTP_PASS = process.env.SMTP_PASS;
export const VERIFICATION_URL = process.env.VERIFICATION_URL;
export const RESETPASSWORD_URL = process.env.RESETPASSWORD_URL;

export const HOST = process.env.HOST;
