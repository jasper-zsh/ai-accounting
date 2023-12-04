import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Config } from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    credentials: true,
    origin: Config.FE_BASE_URL,
  });
  await app.listen(3001);
}
bootstrap();
