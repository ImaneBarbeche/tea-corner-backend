import { Injectable } from '@nestjs/common';
import type { User } from '../user/user.entity';
import { ConfigService } from '@nestjs/config';
import { createTransport, type Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = createTransport({
      host: this.configService.getOrThrow<string>('MAIL_HOST'),
      port: this.configService.get<number>('MAIL_PORT'),
      auth: {
        user: this.configService.getOrThrow<string>('MAIL_USER'),
        pass: this.configService.getOrThrow<string>('MAIL_PASS'),
      },
    });
  }

  async sendVerificationEmail(user: User, token: string) {
    const url = `${this.configService.getOrThrow<string>('FRONTEND_URL')}/verify-email?token=${token}`;

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
    const url = `${this.configService.getOrThrow<string>('FRONTEND_URL')}/reset-password?token=${password_token}`;

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

  async sendDeletionNotification(user: User, deleteScheduledAt: Date) {
    await this.transporter.sendMail({
      from: '"TeaCorner" <no-reply@teacorner.com>',
      to: user.email,
      subject: 'Suppression de votre compte TeaCorner',
      html: `
        <p>Bonjour ${user.user_name || 'utilisateur'},</p>
        <p>Votre compte a été marqué comme supprimé. Il sera définitivement supprimé le <strong>${deleteScheduledAt.toLocaleDateString('fr-FR')}</strong>.</p>
        <p>Vous avez 30 jours pour annuler cette suppression en vous reconnectant à votre compte.</p>
        <p>Cordialement,<br/>L'équipe TeaCorner</p>
      `,
    });
    console.log('Email de suppression envoyé à :', user.email);
  }
}
