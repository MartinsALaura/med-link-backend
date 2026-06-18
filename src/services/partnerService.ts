import {
  PartnerRow,
  CreatePartnerDTO,
  createPartner,
  findPartnerByCnpj,
  findPartnerById,
  findActivePartners,
} from "../models/partnerModel";
import { AppError } from "../utils/AppError";

export async function register(dto: CreatePartnerDTO): Promise<{ id: number }> {
  if (await findPartnerByCnpj(dto.cnpj)) {
    throw new AppError("CNPJ já cadastrado.", 409);
  }
  const id = await createPartner(dto);
  return { id };
}

export async function list(): Promise<PartnerRow[]> {
  return findActivePartners();
}

export async function getById(id: number): Promise<PartnerRow> {
  const partner = await findPartnerById(id);
  if (!partner) throw new AppError("Parceiro não encontrado.", 404);
  return partner;
}
