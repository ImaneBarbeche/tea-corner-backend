import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import type { User } from '../user/user.entity';
import type { Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT),
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  async sendVerificationEmail(user: User, token: string) {
    const url = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    await this.transporter.sendMail({
      from: '"TeaCorner" <no-reply@teacorner.com>',
      to: user.email,
      subject: 'Vérifiez votre email',
      html: `
        <h1>Bienvenue sur TeaCorner!</h1>
        <p>Cliquez sur le lien ci-dessous pour vérifier votre email :</p>
        <a href="${url}">${url}</a>
      `,
    });

    console.log('Email envoyé à :', user.email);
  }

  async sendResetEmail(user: User, password_token: string) {
    const url = `${process.env.FRONTEND_URL}/reset-password?token=${password_token}`;

    await this.transporter.sendMail({
      from: '"TeaCorner" <no-reply@teacorner.com>',
      to: user.email,
      subject: 'Réinitialisation de votre mot de passe',
      html: `
        <h1>Réinitialisation de votre mot de passe</h1>
        <p>Cliquez sur le lien ci-dessous pour créer un nouveau mot de passe :</p>
        <a href="${url}">${url}</a>
        <p>Ce lien expire dans 15 minutes.</p>
      `,
    });

    console.log('Email de reset envoyé à :', user.email);
  }
}
