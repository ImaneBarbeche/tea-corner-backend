import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

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
    origin: ['http://localhost:5173', 'https://teacorner.app'], // front url
    credentials: true, // allows cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
