import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Config } from './config';
import { LogInterceptor } from './log.interceptor';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });
  app.enableCors({
    credentials: true,
    origin: [Config.FE_BASE_URL, 'https://aiac.zcar.tech'],
  });
  app.useGlobalInterceptors(new LogInterceptor());
  await app.listen(3001);
}
bootstrap();
