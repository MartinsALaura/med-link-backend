import { ResultSetHeader, RowDataPacket } from "mysql2";
import { pool } from "../config/db";

export type PartnerStatus = "pendente" | "ativo" | "inativo";

export interface PartnerRow extends RowDataPacket {
  id: number;
  trade_name: string;
  legal_name: string;
  cnpj: string;
  responsible: string;
  email: string;
  phone: string;
  mobile: string;
  cep: string;
  address: string;
  number: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
  business_hours: string;
  latitude: string | null;
  longitude: string | null;
  notes: string | null;
  status: PartnerStatus;
  created_at: string;
  updated_at: string;
}

export interface CreatePartnerDTO {
  tradeName: string;
  legalName: string;
  cnpj: string;
  responsible: string;
  email: string;
  phone: string;
  mobile: string;
  cep: string;
  address: string;
  number: string;
  complement?: string | null;
  neighborhood: string;
  city: string;
  state: string;
  businessHours: string;
  latitude?: number | null;
  longitude?: number | null;
  notes?: string | null;
}

export async function createPartner(dto: CreatePartnerDTO): Promise<number> {
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO partners
      (trade_name, legal_name, cnpj, responsible, email, phone, mobile, cep, address,
       number, complement, neighborhood, city, state, business_hours, latitude,
       longitude, notes, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendente')`,
    [
      dto.tradeName,
      dto.legalName,
      dto.cnpj,
      dto.responsible,
      dto.email,
      dto.phone,
      dto.mobile,
      dto.cep,
      dto.address,
      dto.number,
      dto.complement ?? null,
      dto.neighborhood,
      dto.city,
      dto.state,
      dto.businessHours,
      dto.latitude ?? null,
      dto.longitude ?? null,
      dto.notes ?? null,
    ]
  );
  return result.insertId;
}

export async function findPartnerByCnpj(cnpj: string): Promise<PartnerRow | null> {
  const [rows] = await pool.execute<PartnerRow[]>(
    "SELECT * FROM partners WHERE cnpj = ? LIMIT 1",
    [cnpj]
  );
  return rows[0] ?? null;
}

export async function findPartnerById(id: number): Promise<PartnerRow | null> {
  const [rows] = await pool.execute<PartnerRow[]>(
    "SELECT * FROM partners WHERE id = ? LIMIT 1",
    [id]
  );
  return rows[0] ?? null;
}

// Active partners only — these are the pickup points shown on the map.
export async function findActivePartners(): Promise<PartnerRow[]> {
  const [rows] = await pool.query<PartnerRow[]>(
    "SELECT * FROM partners WHERE status = 'ativo' ORDER BY trade_name"
  );
  return rows;
}
