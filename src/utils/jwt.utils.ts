import app from '@app/app';
import { TokenOption, TokenPayload } from '@app/schemas/jwt.schemas';

export function generateToken(payload: TokenPayload, options: TokenOption) {
  try {
    const token = app.jwt.sign(payload, {
      ...options,
    });
    return token;
  } catch (error) {
    throw new Error(error);
  }
}
