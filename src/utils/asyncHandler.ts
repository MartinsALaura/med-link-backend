import { Request, Response, NextFunction, RequestHandler } from "express";

// Express 4 does not catch errors thrown in async handlers.
// Wrapping a handler forwards any rejected promise to the errorHandler middleware.
export function asyncHandler(fn: RequestHandler): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
