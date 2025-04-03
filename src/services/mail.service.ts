import { FastifyInstance, FastifyRegister, FastifyRequest } from 'fastify';
import nodemailer from 'nodemailer';

import { emailConfig } from '@app/config/email.config';
import { EmailTokenPayload } from '@app/schemas/email.schemas';
import { TokenOption, VerifyTokenResponse } from '@app/schemas/jwt.schemas';
import { UpdateUser } from '@app/schemas/user.schemas';
import { generateToken } from '@app/utils/jwt.utils';

import UserService from './user.service';

export default class MailService {
  private fastify: FastifyInstance;
  private userService: UserService;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
    this.userService = new UserService(fastify);
  }

  createTransporter() {
    return nodemailer.createTransport({
      ...emailConfig.options,
    });
  }

  async sendVerificationEmail(email: string, verificationToken: string): Promise<boolean> {
    try {
      const transporter = this.createTransporter();
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
      return false;
    }
  }

  async sendResetPasswordEmail(email: string, resetPasswordToken: string): Promise<boolean> {
    try {
      const transporter = this.createTransporter();
      const resetPasswordLink = `${emailConfig.resetPasswordUrl}?token=${resetPasswordToken}`;

      const mailOptions = {
        from: emailConfig.fromEmail,
        to: email,
        subject: 'Quên mật khẩu',
        html: `
              <h1>Xác nhận quên mật khẩu</h1>
              <p>Vui lòng nhấp vào liên kết dưới đây để  xác nhận thay đôỉ mật khẩu:</p>
              <a href="${resetPasswordLink}">Xác nhận quên mật khẩu</a>
              <p>Liên kết này sẽ hết hạn sau 2 giờ.</p>
            `,
      };

      await transporter.sendMail(mailOptions);

      return true;
    } catch (error) {
      return false;
    }
  }

  generateEmailToken(payload: EmailTokenPayload, option: TokenOption) {
    try {
      return generateToken(payload, this.fastify, option);
    } catch (error) {
      throw error;
    }
  }

  async verifiedEmail(request: FastifyRequest): Promise<VerifyTokenResponse> {
    try {
      const { userEmail } = request.decodedEmailToken;

      const user = await this.userService.getUserByEmail(userEmail);
      if (!user) {
        const res: VerifyTokenResponse = {
          status: 404,
          message: 'User is not found',
        };
        return res;
      }

      if (user.isVerifiedEmail) {
        const res: VerifyTokenResponse = {
          status: 200,
          message: 'Email has already been verified',
        };
        return res;
      }

      const data: UpdateUser = {
        isVerifiedEmail: true,
      };

      await this.userService.updateUser(user.id, data);

      const res: VerifyTokenResponse = {
        status: 200,
        message: 'Verified successfull',
      };

      return res;
    } catch (error) {
      const res: VerifyTokenResponse = {
        status: 400,
        message: error.message,
      };

      return res;
    }
  }
}
