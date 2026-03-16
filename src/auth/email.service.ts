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
        <div style="background-color:#F2ECE1;padding:48px 24px;font-family:Raleway,Helvetica,Arial,sans-serif;">
          <div style="max-width:460px;margin:0 auto;">
            <p style="color:#2E2E2E;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;margin:0 0 40px;">Tea Corner</p>
            <h1 style="color:#2E2E2E;font-size:26px;font-weight:normal;margin:0 0 16px;line-height:1.3;font-family:Georgia,serif;">Bienvenue.</h1>
            <p style="color:#2E2E2E;font-size:15px;line-height:1.7;margin:0 0 36px;opacity:0.75;">
              Plus qu'une étape — confirmez votre email pour accéder à votre compte.
            </p>
            <a href="${url}" style="display:inline-block;background-color:#2E2E2E;color:#F2ECE1;text-decoration:none;padding:13px 28px;border-radius:4px;font-size:13px;letter-spacing:0.05em;font-family:Raleway,Helvetica,Arial,sans-serif;">
              Confirmer mon email
            </a>
            <hr style="border:none;border-top:1px solid #D6CEBC;margin:48px 0 24px;" />
            <p style="color:#2E2E2E;font-size:12px;margin:0;opacity:0.45;">
              Vous n'avez pas créé de compte ? Ignorez cet email.
            </p>
          </div>
        </div>
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
