import { Request, Response } from "express";
import { z } from "zod";
import * as requestService from "../services/requestService";
import { AppError } from "../utils/AppError";

const createSchema = z.object({
  donationId: z.number().int().positive(),
});

const updateStatusSchema = z.object({
  status: z.enum(["aprovado", "recusado", "entregue"]),
});

function parseId(req: Request): number {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) throw new AppError("ID inválido.", 400);
  return id;
}

export async function create(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new AppError("Não autenticado.", 401);
  const { donationId } = createSchema.parse(req.body);
  const result = await requestService.create(req.user.id, donationId);
  res.status(201).json({ ...result, message: "Solicitação registrada com sucesso." });
}

export async function list(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new AppError("Não autenticado.", 401);
  const requests = await requestService.listByUser(req.user.id);
  res.json(requests);
}

export async function getById(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new AppError("Não autenticado.", 401);
  const request = await requestService.getById(req.user.id, req.user.role, parseId(req));
  res.json(request);
}

export async function updateStatus(req: Request, res: Response): Promise<void> {
  const { status } = updateStatusSchema.parse(req.body);
  const updated = await requestService.updateStatus(parseId(req), status);
  res.json(updated);
}

export async function cancel(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new AppError("Não autenticado.", 401);
  await requestService.cancel(req.user.id, parseId(req));
  res.status(204).send();
}
