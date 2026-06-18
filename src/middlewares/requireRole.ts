import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import { Role } from "../models/userModel";

// Allows the request only when req.user.role is one of the given roles.
// Must run after the `auth` middleware.
export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new AppError("Acesso negado.", 403);
    }
    next();
  };
}
