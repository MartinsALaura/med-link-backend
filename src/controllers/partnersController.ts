import { Request, Response } from "express";
import { z } from "zod";
import * as partnerService from "../services/partnerService";
import { AppError } from "../utils/AppError";

const createSchema = z.object({
  tradeName: z.string().min(1),
  legalName: z.string().min(1),
  cnpj: z.string().min(1),
  responsible: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  mobile: z.string().min(1),
  cep: z.string().min(1),
  address: z.string().min(1),
  number: z.string().min(1),
  complement: z.string().optional(),
  neighborhood: z.string().min(1),
  city: z.string().min(1),
  state: z.string().length(2),
  businessHours: z.string().min(1),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  notes: z.string().optional(),
});

function parseId(req: Request): number {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) throw new AppError("ID inválido.", 400);
  return id;
}

export async function create(req: Request, res: Response): Promise<void> {
  const body = createSchema.parse(req.body);
  const result = await partnerService.register({
    tradeName: body.tradeName,
    legalName: body.legalName,
    cnpj: body.cnpj,
    responsible: body.responsible,
    email: body.email,
    phone: body.phone,
    mobile: body.mobile,
    cep: body.cep,
    address: body.address,
    number: body.number,
    complement: body.complement ?? null,
    neighborhood: body.neighborhood,
    city: body.city,
    state: body.state,
    businessHours: body.businessHours,
    latitude: body.latitude ?? null,
    longitude: body.longitude ?? null,
    notes: body.notes ?? null,
  });
  res.status(201).json({ ...result, message: "Parceiro cadastrado com sucesso." });
}

export async function list(_req: Request, res: Response): Promise<void> {
  const partners = await partnerService.list();
  res.json(partners);
}

export async function getById(req: Request, res: Response): Promise<void> {
  const partner = await partnerService.getById(parseId(req));
  res.json(partner);
}
