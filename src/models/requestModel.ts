import { ResultSetHeader, RowDataPacket } from "mysql2";
import { pool } from "../config/db";

export type RequestStatus =
  | "pendente"
  | "aprovado"
  | "recusado"
  | "entregue"
  | "cancelado";

export interface RequestRow extends RowDataPacket {
  id: number;
  beneficiary_id: number;
  donation_id: number;
  status: RequestStatus;
  requested_at: string;
  created_at: string;
  updated_at: string;
  // Joined donation info for list/detail views.
  donation_name?: string;
  donation_status?: string;
}

export async function createRequest(
  beneficiaryId: number,
  donationId: number
): Promise<number> {
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO requests (beneficiary_id, donation_id, status, requested_at)
     VALUES (?, ?, 'pendente', NOW())`,
    [beneficiaryId, donationId]
  );
  return result.insertId;
}

export async function findRequestsByUser(userId: number): Promise<RequestRow[]> {
  const [rows] = await pool.execute<RequestRow[]>(
    `SELECT r.*, d.name AS donation_name, d.status AS donation_status
     FROM requests r
     JOIN donations d ON d.id = r.donation_id
     WHERE r.beneficiary_id = ?
     ORDER BY r.requested_at DESC`,
    [userId]
  );
  return rows;
}

export async function findRequestById(id: number): Promise<RequestRow | null> {
  const [rows] = await pool.execute<RequestRow[]>(
    `SELECT r.*, d.name AS donation_name, d.status AS donation_status
     FROM requests r
     JOIN donations d ON d.id = r.donation_id
     WHERE r.id = ? LIMIT 1`,
    [id]
  );
  return rows[0] ?? null;
}

export async function updateRequestStatus(
  id: number,
  status: RequestStatus
): Promise<void> {
  await pool.execute("UPDATE requests SET status = ? WHERE id = ?", [status, id]);
}
