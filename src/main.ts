import helmet from 'helmet';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { DatabaseExceptionFilter } from './shared/filters/database-exception.filter';
import { AllExceptionsFilter } from './shared/filters/all-exceptions.filter';
import { DiscordService } from './shared/infrastructure/services/discord.service';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.use(cookieParser());
  app.setGlobalPrefix('api');

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  app.enableCors({
    origin: [frontendUrl],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const discordService = app.get(DiscordService);
  app.useGlobalFilters(
    new AllExceptionsFilter(discordService),
    new DatabaseExceptionFilter(),
  );

  const config = new DocumentBuilder()
    .setTitle('Gabinete API')
    .setDescription('Documentação da API de Gestão de Gabinete')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
