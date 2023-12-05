import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
// import { WsResponse } from '@nestjs/websockets';
import { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LogInterceptor implements NestInterceptor {
  private readonly logger = new Logger('RequestLog');

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const end = Date.now();
        switch (context.getType()) {
          //   case 'ws':
          //     this.logger.log(
          //       `[WS] ${context.switchToWs().getPattern()} -> ${r?.event} [${
          //         end - start
          //       }ms]`,
          //     );
          //     break;
          case 'http':
            const ctx = context.switchToHttp();
            const req = ctx.getRequest<Request>();
            const res = ctx.getResponse<Response>();
            const { ip, method, originalUrl } = req;
            const { statusCode } = res;
            this.logger.log(
              `[HTTP] ${statusCode} ${method} ${originalUrl} - ${ip} [${
                end - start
              }ms]`,
            );
        }
      }),
    );
  }
}
