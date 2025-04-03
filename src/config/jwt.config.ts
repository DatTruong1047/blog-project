import { TokenOption } from '@app/schemas/jwt.schemas';

export const accessTokenOption: TokenOption = {
  expiresIn: '2h',
};

export const refreshTokenOption: TokenOption = {
  expiresIn: '7d',
};
