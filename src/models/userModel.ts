import { ResultSetHeader, RowDataPacket } from "mysql2";
import { pool } from "../config/db";

export type Role = "USER" | "PROFESSIONAL" | "ADMIN";
export type UserStatus = "ativo" | "bloqueado";

// Raw row including binary columns (Buffers). Used by detail queries.
export interface UserRow extends RowDataPacket {
  id: number;
  name: string;
  cpf: string;
  birth_date: string;
  phone: string;
  email: string;
  password_hash: string;
  cep: string;
  address: string;
  number: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
  identity_document: Buffer | null;
  identity_document_name: string | null;
  identity_document_type: string | null;
  sus_card_number: string;
  // Null for USER role. Set by ADMIN to link a PROFESSIONAL to their pharmacy.
  partner_id: number | null;
  photo: Buffer | null;
  photo_name: string | null;
  photo_type: string | null;
  role: Role;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

// Lightweight row for list views (no BLOB columns).
export interface UserListRow extends RowDataPacket {
  id: number;
  name: string;
  cpf: string;
  email: string;
  phone: string;
  role: Role;
  status: UserStatus;
  created_at: string;
}

export interface CreateUserDTO {
  name: string;
  cpf: string;
  birthDate: string;
  phone: string;
  email: string;
  passwordHash: string;
  cep: string;
  address: string;
  number: string;
  complement?: string | null;
  neighborhood: string;
  city: string;
  state: string;
  identityDocument: Buffer;
  identityDocumentName: string;
  identityDocumentType: string;
  susCardNumber: string;
  photo?: Buffer | null;
  photoName?: string | null;
  photoType?: string | null;
}

export interface UpdateUserDTO {
  name: string;
  phone: string;
  cep: string;
  address: string;
  number: string;
  complement?: string | null;
  neighborhood: string;
  city: string;
  state: string;
  susCardNumber: string;
  photo?: Buffer | null;
  photoName?: string | null;
  photoType?: string | null;
}

export async function createUser(dto: CreateUserDTO): Promise<number> {
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO users
      (name, cpf, birth_date, phone, email, password_hash, cep, address, number,
       complement, neighborhood, city, state, identity_document,
       identity_document_name, identity_document_type, sus_card_number,
       photo, photo_name, photo_type, role, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'USER', 'ativo')`,
    [
      dto.name,
      dto.cpf,
      dto.birthDate,
      dto.phone,
      dto.email,
      dto.passwordHash,
      dto.cep,
      dto.address,
      dto.number,
      dto.complement ?? null,
      dto.neighborhood,
      dto.city,
      dto.state,
      dto.identityDocument,
      dto.identityDocumentName,
      dto.identityDocumentType,
      dto.susCardNumber,
      dto.photo ?? null,
      dto.photoName ?? null,
      dto.photoType ?? null,
    ]
  );
  return result.insertId;
}

export async function findUserByEmail(email: string): Promise<UserRow | null> {
  const [rows] = await pool.execute<UserRow[]>(
    "SELECT * FROM users WHERE email = ? LIMIT 1",
    [email]
  );
  return rows[0] ?? null;
}

export async function findUserByCpf(cpf: string): Promise<UserRow | null> {
  const [rows] = await pool.execute<UserRow[]>(
    "SELECT * FROM users WHERE cpf = ? LIMIT 1",
    [cpf]
  );
  return rows[0] ?? null;
}

export async function findUserById(id: number): Promise<UserRow | null> {
  const [rows] = await pool.execute<UserRow[]>(
    "SELECT * FROM users WHERE id = ? LIMIT 1",
    [id]
  );
  return rows[0] ?? null;
}

export async function findAllUsers(): Promise<UserListRow[]> {
  const [rows] = await pool.query<UserListRow[]>(
    `SELECT id, name, cpf, email, phone, role, status, created_at
     FROM users ORDER BY created_at DESC`
  );
  return rows;
}

export async function updateUser(id: number, dto: UpdateUserDTO): Promise<void> {
  // Photo is only overwritten when a new one is provided.
  const fields: string[] = [
    "name = ?",
    "phone = ?",
    "cep = ?",
    "address = ?",
    "number = ?",
    "complement = ?",
    "neighborhood = ?",
    "city = ?",
    "state = ?",
    "sus_card_number = ?",
  ];
  const values: (string | Buffer | number | null)[] = [
    dto.name,
    dto.phone,
    dto.cep,
    dto.address,
    dto.number,
    dto.complement ?? null,
    dto.neighborhood,
    dto.city,
    dto.state,
    dto.susCardNumber,
  ];

  if (dto.photo) {
    fields.push("photo = ?", "photo_name = ?", "photo_type = ?");
    values.push(dto.photo, dto.photoName ?? null, dto.photoType ?? null);
  }

  values.push(id);
  await pool.execute(
    `UPDATE users SET ${fields.join(", ")} WHERE id = ?`,
    values
  );
}

export async function updatePassword(id: number, passwordHash: string): Promise<void> {
  await pool.execute("UPDATE users SET password_hash = ? WHERE id = ?", [
    passwordHash,
    id,
  ]);
}

export async function updateUserStatus(id: number, status: UserStatus): Promise<void> {
  await pool.execute("UPDATE users SET status = ? WHERE id = ?", [status, id]);
}

// Assigns or removes the pharmacy a professional belongs to.
// partnerId = null removes the association.
export async function updateUserPartner(
  id: number,
  partnerId: number | null
): Promise<void> {
  await pool.execute("UPDATE users SET partner_id = ? WHERE id = ?", [partnerId, id]);
}
