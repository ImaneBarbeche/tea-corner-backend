import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { doubleCsrf } from 'csrf-csrf';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  });

  // simple csrf token, without using sessions
  const { doubleCsrfProtection } = doubleCsrf({
    getSecret: () => 'VotreSuperSecretIci123',
    getSessionIdentifier: (req) => {
      return req.ip || 'anonymous';
    },
    cookieName: 'csrf-token',
    cookieOptions: {
      sameSite: 'lax', // 'strict' option is hindering in dev mode
      path: '/',
      secure: false, // only for http dev, otherwise, for https, use 'true'
      httpOnly: true,
    },
    size: 32,
    ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
    getCsrfTokenFromRequest: (req) => req.headers['x-csrf-token'],
  });

  if (process.env.NODE_ENV === 'production') {
  app.use(doubleCsrfProtection);
}
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
