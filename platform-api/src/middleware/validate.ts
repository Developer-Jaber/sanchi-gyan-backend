import { NextFunction, Request, Response } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { ApiError } from './errorHandler';

export function validate(schema: AnyZodObject) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      const zerr = error as ZodError;
      throw new ApiError(400, 'Validation failed', zerr.flatten());
    }
  };
}
