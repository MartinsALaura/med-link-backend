import { Request, Response } from "express";
import { z } from "zod";
import * as authService from "../services/authService";
import { AppError } from "../utils/AppError";

const registerSchema = z.object({
  name: z.string().min(1),
  cpf: z.string().min(1),
  birthDate: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  cep: z.string().min(1),
  address: z.string().min(1),
  number: z.string().min(1),
  complement: z.string().optional(),
  neighborhood: z.string().min(1),
  city: z.string().min(1),
  state: z.string().length(2),
  susCardNumber: z.string().min(1),
  identityDocumentBase64: z.string().min(1),
  identityDocumentName: z.string().min(1),
  identityDocumentType: z.string().min(1),
  photoBase64: z.string().optional(),
  photoName: z.string().optional(),
  photoType: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function register(req: Request, res: Response): Promise<void> {
  const body = registerSchema.parse(req.body);
  const { id } = await authService.register(body);
  res.status(201).json({ id, message: "Usuário cadastrado com sucesso." });
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = loginSchema.parse(req.body);
  const { token } = await authService.login(email, password);
  res.json({ token });
}

export async function me(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new AppError("Não autenticado.", 401);
  const user = await authService.getMe(req.user.id);
  res.json(user);
}
