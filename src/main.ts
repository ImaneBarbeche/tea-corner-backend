import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { doubleCsrf } from 'csrf-csrf';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

// simple csrf token, without using sessions
const { doubleCsrfProtection, generateCsrfToken } = doubleCsrf({
  getSecret: () => {
  const secret = process.env.CSRF_SECRET;
  if (!secret) throw new Error('CSRF_SECRET env variable is not set');
  return secret;
},
  getSessionIdentifier: (req) => req.ip ?? 'anonymous',
  cookieName: 'csrf-token',
  cookieOptions: {
    sameSite: 'lax',
    path: '/',
    secure: false,
    httpOnly: true,
  },
  size: 32,
  ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
  getCsrfTokenFromRequest: (req) => req.headers['x-csrf-token'],
});

export { generateCsrfToken };

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('TeaCorner Api')
    .setDescription('Documentation de l/API TeaCorner ')
    .setVersion('1.0')
    .addCookieAuth('access_token') // allows swagger to document auth with cookies
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // documentation available at backend address

  app.use(cookieParser());

  app.enableCors({
    origin: 'http://localhost:5173', // front url
    credentials: true, // allows cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  });

  app.use(doubleCsrfProtection);

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
