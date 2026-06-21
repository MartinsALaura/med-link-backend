import { ResultSetHeader, RowDataPacket } from "mysql2";
import { pool } from "../config/db";

export type DonationStatus = "pendente" | "aprovado" | "recusado" | "concluido";

// Full row including binary columns. Used by detail queries.
export interface DonationRow extends RowDataPacket {
  id: number;
  donor_id: number;
  pickup_point_id: number | null;
  triaged_by: number | null;
  name: string;
  active_ingredient: string;
  concentration: string;
  dosage_form: string;
  laboratory: string;
  category: string;
  tarja: string;
  quantity: number;
  lote: string | null;
  expiration_date: string;
  description: string | null;
  donor_address: string;
  sealed: number;
  original_packaging: number;
  requires_prescription: number;
  photo: Buffer | null;
  photo_name: string | null;
  photo_type: string | null;
  indication: string | null;
  contraindication: string | null;
  care_notes: string | null;
  status: DonationStatus;
  created_at: string;
  updated_at: string;
  // Joined from partners (detail/list views).
  pickup_point_name?: string | null;
  pickup_point_address?: string | null;
}

// List row. Includes the photo BLOB so the catalog/grid can render images
// straight from the database (converted to a data URI in the service layer).
export interface DonationListRow extends RowDataPacket {
  id: number;
  donor_id: number;
  name: string;
  active_ingredient: string;
  concentration: string;
  dosage_form: string;
  laboratory: string;
  category: string;
  tarja: string;
  quantity: number;
  expiration_date: string;
  requires_prescription: number;
  status: DonationStatus;
  pickup_point_id: number | null;
  pickup_point_name: string | null;
  donor_name: string | null;
  donor_address: string;
  indication: string | null;
  contraindication: string | null;
  care_notes: string | null;
  photo: Buffer | null;
  photo_type: string | null;
  created_at: string;
}

export interface CreateDonationDTO {
  donorId: number;
  name: string;
  activeIngredient: string;
  concentration: string;
  dosageForm: string;
  laboratory: string;
  category: string;
  tarja: string;
  quantity: number;
  lote?: string | null;
  expirationDate: string;
  description?: string | null;
  donorAddress: string;
  sealed: boolean;
  originalPackaging: boolean;
  requiresPrescription: boolean;
  photo: Buffer;
  photoName: string;
  photoType: string;
  indication?: string | null;
  contraindication?: string | null;
  careNotes?: string | null;
}

export interface UpdateDonationDTO {
  name: string;
  activeIngredient: string;
  concentration: string;
  dosageForm: string;
  laboratory: string;
  category: string;
  tarja: string;
  quantity: number;
  lote?: string | null;
  expirationDate: string;
  description?: string | null;
  requiresPrescription: boolean;
  indication?: string | null;
  contraindication?: string | null;
  careNotes?: string | null;
}

export async function createDonation(dto: CreateDonationDTO): Promise<number> {
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO donations
      (donor_id, name, active_ingredient, concentration, dosage_form, laboratory,
       category, tarja, quantity, lote, expiration_date, description, donor_address,
       sealed, original_packaging, requires_prescription, photo, photo_name, photo_type,
       indication, contraindication, care_notes, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendente')`,
    [
      dto.donorId,
      dto.name,
      dto.activeIngredient,
      dto.concentration,
      dto.dosageForm,
      dto.laboratory,
      dto.category,
      dto.tarja,
      dto.quantity,
      dto.lote ?? null,
      dto.expirationDate,
      dto.description ?? null,
      dto.donorAddress,
      dto.sealed ? 1 : 0,
      dto.originalPackaging ? 1 : 0,
      dto.requiresPrescription ? 1 : 0,
      dto.photo,
      dto.photoName,
      dto.photoType,
      dto.indication ?? null,
      dto.contraindication ?? null,
      dto.careNotes ?? null,
    ]
  );
  return result.insertId;
}

export async function findDonations(filters: {
  status?: string;
  search?: string;
}): Promise<DonationListRow[]> {
  const where: string[] = [];
  const values: unknown[] = [];

  if (filters.status) {
    where.push("d.status = ?");
    values.push(filters.status);
  }
  if (filters.search) {
    where.push("(d.name LIKE ? OR d.active_ingredient LIKE ?)");
    values.push(`%${filters.search}%`, `%${filters.search}%`);
  }

  const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const [rows] = await pool.query<DonationListRow[]>(
    `SELECT d.id, d.donor_id, d.name, d.active_ingredient, d.concentration,
            d.dosage_form, d.laboratory, d.category, d.tarja, d.quantity,
            d.expiration_date, d.requires_prescription, d.status,
            d.pickup_point_id, p.trade_name AS pickup_point_name,
            u.name AS donor_name, d.donor_address,
            d.indication, d.contraindication, d.care_notes,
            d.photo, d.photo_type, d.created_at
     FROM donations d
     LEFT JOIN partners p ON p.id = d.pickup_point_id
     JOIN users u ON u.id = d.donor_id
     ${whereClause}
     ORDER BY d.created_at DESC`,
    values
  );
  return rows;
}

export async function findDonationById(id: number): Promise<DonationRow | null> {
  const [rows] = await pool.execute<DonationRow[]>(
    `SELECT d.*, p.trade_name AS pickup_point_name,
            CONCAT_WS(', ', p.address, p.number, p.neighborhood, p.city, p.state) AS pickup_point_address
     FROM donations d
     LEFT JOIN partners p ON p.id = d.pickup_point_id
     WHERE d.id = ? LIMIT 1`,
    [id]
  );
  return rows[0] ?? null;
}

export async function updateDonationStatus(
  id: number,
  status: DonationStatus,
  triagedBy: number,
  pickupPointId?: number | null
): Promise<void> {
  await pool.execute(
    `UPDATE donations
     SET status = ?, triaged_by = ?, pickup_point_id = COALESCE(?, pickup_point_id)
     WHERE id = ?`,
    [status, triagedBy, pickupPointId ?? null, id]
  );
}

export async function updateDonation(
  id: number,
  dto: UpdateDonationDTO
): Promise<void> {
  await pool.execute(
    `UPDATE donations SET
       name = ?, active_ingredient = ?, concentration = ?, dosage_form = ?,
       laboratory = ?, category = ?, tarja = ?, quantity = ?, lote = ?,
       expiration_date = ?, description = ?, requires_prescription = ?,
       indication = ?, contraindication = ?, care_notes = ?
     WHERE id = ?`,
    [
      dto.name,
      dto.activeIngredient,
      dto.concentration,
      dto.dosageForm,
      dto.laboratory,
      dto.category,
      dto.tarja,
      dto.quantity,
      dto.lote ?? null,
      dto.expirationDate,
      dto.description ?? null,
      dto.requiresPrescription ? 1 : 0,
      dto.indication ?? null,
      dto.contraindication ?? null,
      dto.careNotes ?? null,
      id,
    ]
  );
}

export async function deleteDonation(id: number): Promise<void> {
  await pool.execute("DELETE FROM donations WHERE id = ?", [id]);
}
