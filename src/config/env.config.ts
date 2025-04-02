import * as dotenv from 'dotenv';
dotenv.config();

export const PORT = +process.env.PORT;
export const SECRET_KEY = process.env.SECRET_KEY;
export const COOKIE_SECRET_KEY = process.env.COOKIE_KEY;
