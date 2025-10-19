import { NextFunction, Request, Response } from 'express';
import xss from 'xss';

function sanitizeObject(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') return xss(obj);
  if (Array.isArray(obj)) return obj.map(sanitizeObject);
  if (typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      result[key] = sanitizeObject(value);
    }
    return result;
  }
  return obj;
}

export function sanitizeBody(req: Request, _res: Response, next: NextFunction) {
  req.body = sanitizeObject(req.body);
  next();
}
