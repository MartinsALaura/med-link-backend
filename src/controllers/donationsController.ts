import { Request, Response } from "express";
import { z } from "zod";
import * as donationService from "../services/donationService";
import { AppError } from "../utils/AppError";

const createSchema = z.object({
  name: z.string().min(1),
  activeIngredient: z.string().min(1),
  concentration: z.string().min(1),
  dosageForm: z.string().min(1),
  laboratory: z.string().min(1),
  category: z.string().min(1),
  tarja: z.string().min(1),
  quantity: z.number().int().positive(),
  lote: z.string().optional(),
  expirationDate: z.string().min(1),
  description: z.string().optional(),
  donorAddress: z.string().min(1),
  sealed: z.literal(true),
  originalPackaging: z.literal(true),
  requiresPrescription: z.boolean(),
  photoBase64: z.string().min(1),
  photoName: z.string().min(1),
  photoType: z.string().min(1),
  indication: z.string().optional(),
  contraindication: z.string().optional(),
  careNotes: z.string().optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(["aprovado", "recusado", "concluido"]),
});

const editSchema = z.object({
  name: z.string().min(1),
  activeIngredient: z.string().min(1),
  concentration: z.string().min(1),
  dosageForm: z.string().min(1),
  laboratory: z.string().min(1),
  category: z.string().min(1),
  tarja: z.string().min(1),
  quantity: z.number().int().positive(),
  lote: z.string().optional(),
  expirationDate: z.string().min(1),
  description: z.string().optional(),
  requiresPrescription: z.boolean(),
  indication: z.string().optional(),
  contraindication: z.string().optional(),
  careNotes: z.string().optional(),
});

function parseId(req: Request): number {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) throw new AppError("ID inválido.", 400);
  return id;
}

export async function create(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new AppError("Não autenticado.", 401);
  const body = createSchema.parse(req.body);
  const result = await donationService.create(req.user.id, body);
  res.status(201).json({ ...result, message: "Doação cadastrada com sucesso." });
}

export async function list(req: Request, res: Response): Promise<void> {
  const status = typeof req.query.status === "string" ? req.query.status : undefined;
  const search = typeof req.query.search === "string" ? req.query.search : undefined;
  const donations = await donationService.list({ status, search });
  res.json(donations);
}

export async function getById(req: Request, res: Response): Promise<void> {
  const donation = await donationService.getById(parseId(req));
  res.json(donation);
}

export async function updateStatus(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new AppError("Não autenticado.", 401);
  const { status } = updateStatusSchema.parse(req.body);
  const updated = await donationService.updateStatus(req.user.id, parseId(req), status);
  res.json(updated);
}

export async function edit(req: Request, res: Response): Promise<void> {
  const body = editSchema.parse(req.body);
  const updated = await donationService.edit(parseId(req), {
    name: body.name,
    activeIngredient: body.activeIngredient,
    concentration: body.concentration,
    dosageForm: body.dosageForm,
    laboratory: body.laboratory,
    category: body.category,
    tarja: body.tarja,
    quantity: body.quantity,
    lote: body.lote ?? null,
    expirationDate: body.expirationDate,
    description: body.description ?? null,
    requiresPrescription: body.requiresPrescription,
    indication: body.indication ?? null,
    contraindication: body.contraindication ?? null,
    careNotes: body.careNotes ?? null,
  });
  res.json(updated);
}

export async function remove(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new AppError("Não autenticado.", 401);
  await donationService.remove(req.user.id, parseId(req));
  res.status(204).send();
}
