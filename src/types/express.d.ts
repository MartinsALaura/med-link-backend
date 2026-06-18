import { Role } from "../models/userModel";

// Populated by the `auth` middleware after verifying the JWT.
declare global {
  namespace Express {
    interface Request {
      user?: { id: number; role: Role };
    }
  }
}

export {};
