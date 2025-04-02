import { FastifyInstance } from 'fastify';
import nodemailer from 'nodemailer';

import { emailConfig } from '@app/config/email.config';
import { emailPayload } from '@app/schemas/email.schemas';
import { tokenOption, verifyTokenResponse } from '@app/schemas/jwt.schemas';
import { updateUser } from '@app/schemas/user.schemas';
import { generateToken } from '@app/utils/jwt.utils';

import { getUserByEmailService, updateUserService } from './user.service';

export function createTransporter() {
  return nodemailer.createTransport({
    host: emailConfig.host,
    port: emailConfig.port,
    secure: emailConfig.secure,
    auth: emailConfig.auth,
  });
}

export async function sendVerificationEmail(email: string, verificationToken: string): Promise<boolean> {
  try {
    const transporter = createTransporter();
    const verificationLink = `${emailConfig.verificationUrl}?token=${verificationToken}`;

    const mailOptions = {
      from: emailConfig.fromEmail,
      to: email,
      subject: 'Xác thực tài khoản của bạn',
      html: `
            <h1>Xác thực tài khoản</h1>
            <p>Cảm ơn bạn đã đăng ký! Vui lòng nhấp vào liên kết dưới đây để xác thực email của bạn:</p>
            <a href="${verificationLink}">Xác thực tài khoản</a>
            <p>Liên kết này sẽ hết hạn sau 24 giờ.</p>
          `,
    };

    await transporter.sendMail(mailOptions);

    return true;
  } catch (error) {
    console.error('Send mail error ', error);
    throw new Error(error);
  }
}

export function generateVerifyEmailTokenService(payload: emailPayload, fastify: FastifyInstance, option: tokenOption) {
  try {
    return generateToken(payload, fastify, option);
  } catch (error) {
    throw new Error(error);
  }
}

export async function verifiedEmailService(fastify: FastifyInstance, token: string): Promise<verifyTokenResponse> {
  try {
    const decoded: emailPayload = fastify.jwt.verify(token);
    const { userEmail } = decoded;

    const user = await getUserByEmailService(userEmail, fastify);
    if (!user) {
      const res: verifyTokenResponse = {
        status: 404,
        message: 'User is not found',
      };
      return res;
    }

    const data: updateUser = {
      isVerifiedEmail: true,
    };

    await updateUserService(fastify, user.id, data);

    const res: verifyTokenResponse = {
      status: 200,
      message: 'Verified successfull',
    };

    return res;
  } catch (error) {
    const res: verifyTokenResponse = {
      status: 400,
      message: error.message,
    };

    return res;
  }
}
