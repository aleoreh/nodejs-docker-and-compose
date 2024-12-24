import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { NotFoundError } from 'rxjs';
import { AccessDeniedError } from './access-denied.error';
import { AlreadyExistsError } from './already-exists.error';
import { BadOfferError } from './bad-offer.error';
import { DomainError } from './domain-error';

@Catch(DomainError)
export class DomainErrorFilter implements ExceptionFilter {
  catch(error: DomainError, host: ArgumentsHost) {
    let httpStatus: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR;

    // TODO: if-elseif
    if (error instanceof AccessDeniedError) httpStatus = HttpStatus.FORBIDDEN;

    if (error instanceof AlreadyExistsError) httpStatus = 409;

    if (error instanceof NotFoundError) httpStatus = HttpStatus.NOT_FOUND;

    if (error instanceof BadOfferError) httpStatus = HttpStatus.BAD_REQUEST;

    Logger.error(`Ошибочка вышла: ${error.message}`, error.stack);

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = httpStatus;

    response.status(status).json({
      statusCode: status,
      message: error.message,
    });
  }
}
