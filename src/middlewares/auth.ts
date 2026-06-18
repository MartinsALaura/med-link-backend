import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/AppError";
import { env } from "../config/env";
import { Role } from "../models/userModel";

interface TokenPayload {
  sub: number;
  role: Role;
}

// Verifies `Authorization: Bearer <token>` and populates req.user.
export function auth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    throw new AppError("Token de autenticação ausente.", 401);
  }

  const token = header.slice("Bearer ".length).trim();
  try {
    const payload = jwt.verify(token, env.jwt.secret) as unknown as TokenPayload;
    req.user = { id: Number(payload.sub), role: payload.role };
    next();
  } catch {
    throw new AppError("Token inválido ou expirado.", 401);
  }
}
