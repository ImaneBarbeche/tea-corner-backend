import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { doubleCsrf } from 'csrf-csrf';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

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

  // simple csrf token, without using sessions
  const { doubleCsrfProtection } = doubleCsrf({
    getSecret: () => configService.get('CSRF_SECRET').toString(),
    getSessionIdentifier: (req) => {
      return req.ip || 'anonymous'; // uses the ip adress as session id
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
void bootstrap();
