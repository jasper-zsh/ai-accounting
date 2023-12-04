import { Global, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AIModule } from './ai/ai.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './prisma.service';
import * as session from 'express-session';
import * as passport from 'passport';
import { PrismaSessionStore } from '@quixo3/prisma-session-store';

@Global()
@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), AIModule, AuthModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
  exports: [PrismaService],
})
export class AppModule implements NestModule {
  constructor(private prisma: PrismaService) {}

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        session({
          secret: 'test',
          cookie: {
            maxAge: 30 * 24 * 3600 * 1000,
          },
          resave: false,
          saveUninitialized: false,
          store: new PrismaSessionStore(this.prisma, {
            checkPeriod: 2 * 60 * 1000,
            dbRecordIdIsSessionId: true,
          }),
        }),
        passport.initialize(),
        passport.session(),
      )
      .forRoutes('*');
  }
}
