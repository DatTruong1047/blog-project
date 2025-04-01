import { tokenOption } from '@app/schemas/jwt.schemas';

export const accessTokenOption: tokenOption = {
  expiresIn: '2h',
};

export const refreshTokenOption: tokenOption = {
  expiresIn: '7d',
};
