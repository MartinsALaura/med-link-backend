import { Request, Response } from "express";
import { z } from "zod";
import * as userService from "../services/userService";
import { AppError } from "../utils/AppError";
import { base64ToBuffer } from "../utils/base64";

const updateSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  cep: z.string().min(1),
  address: z.string().min(1),
  number: z.string().min(1),
  complement: z.string().optional(),
  neighborhood: z.string().min(1),
  city: z.string().min(1),
  state: z.string().length(2),
  susCardNumber: z.string().min(1),
  photoBase64: z.string().optional(),
  photoName: z.string().optional(),
  photoType: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
});

const statusSchema = z.object({
  status: z.enum(["ativo", "bloqueado"]),
});

function parseId(req: Request): number {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError("ID inválido.", 400);
  }
  return id;
}

export async function list(_req: Request, res: Response): Promise<void> {
  const users = await userService.listUsers();
  res.json(users);
}

export async function getById(req: Request, res: Response): Promise<void> {
  const user = await userService.getUserById(parseId(req));
  res.json(user);
}

export async function update(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new AppError("Não autenticado.", 401);
  const body = updateSchema.parse(req.body);
  const updated = await userService.updateProfile(req.user.id, parseId(req), {
    name: body.name,
    phone: body.phone,
    cep: body.cep,
    address: body.address,
    number: body.number,
    complement: body.complement ?? null,
    neighborhood: body.neighborhood,
    city: body.city,
    state: body.state,
    susCardNumber: body.susCardNumber,
    photo: body.photoBase64 ? base64ToBuffer(body.photoBase64) : null,
    photoName: body.photoName ?? null,
    photoType: body.photoType ?? null,
  });
  res.json(updated);
}

export async function changePassword(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new AppError("Não autenticado.", 401);
  const { currentPassword, newPassword } = passwordSchema.parse(req.body);
  await userService.changePassword(
    req.user.id,
    parseId(req),
    currentPassword,
    newPassword
  );
  res.json({ message: "Senha alterada com sucesso." });
}

export async function setStatus(req: Request, res: Response): Promise<void> {
  const { status } = statusSchema.parse(req.body);
  await userService.setUserStatus(parseId(req), status);
  res.json({ message: "Status atualizado com sucesso." });
}

const partnerSchema = z.object({
  partnerId: z.number().int().positive().nullable(),
});

export async function setPartner(req: Request, res: Response): Promise<void> {
  const { partnerId } = partnerSchema.parse(req.body);
  await userService.setPartner(parseId(req), partnerId);
  res.json({ message: "Farmácia parceira atualizada com sucesso." });
}
