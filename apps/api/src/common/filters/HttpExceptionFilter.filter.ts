import { ArgumentsHost, Catch, HttpException } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';

@Catch(HttpException)
export class HttpExceptionTransformationFilter extends BaseWsExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const properException = new WsException(exception.getResponse());
    super.catch(properException, host);
  }
}
