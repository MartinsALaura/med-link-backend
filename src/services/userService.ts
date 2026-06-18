import bcrypt from "bcrypt";
import {
  UserRow,
  UserListRow,
  Role,
  UserStatus,
  findUserById,
  findAllUsers,
  updateUser,
  updatePassword,
  updateUserStatus,
  updateUserPartner,
  UpdateUserDTO,
} from "../models/userModel";
import { findPartnerById } from "../models/partnerModel";
import { AppError } from "../utils/AppError";
import { bufferToBase64 } from "../utils/base64";

// Public shape returned by the API: no password_hash, blobs as base64 data URIs.
export interface PublicUser {
  id: number;
  name: string;
  cpf: string;
  birthDate: string;
  phone: string;
  email: string;
  cep: string;
  address: string;
  number: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
  susCardNumber: string;
  partnerId: number | null;
  identityDocument: string | null;
  identityDocumentName: string | null;
  identityDocumentType: string | null;
  photo: string | null;
  photoName: string | null;
  photoType: string | null;
  role: Role;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export function toPublicUser(row: UserRow): PublicUser {
  return {
    id: row.id,
    name: row.name,
    cpf: row.cpf,
    birthDate: row.birth_date,
    phone: row.phone,
    email: row.email,
    cep: row.cep,
    address: row.address,
    number: row.number,
    complement: row.complement,
    neighborhood: row.neighborhood,
    city: row.city,
    state: row.state,
    susCardNumber: row.sus_card_number,
    partnerId: row.partner_id,
    identityDocument:
      row.identity_document && row.identity_document_type
        ? bufferToBase64(row.identity_document, row.identity_document_type)
        : null,
    identityDocumentName: row.identity_document_name,
    identityDocumentType: row.identity_document_type,
    photo:
      row.photo && row.photo_type ? bufferToBase64(row.photo, row.photo_type) : null,
    photoName: row.photo_name,
    photoType: row.photo_type,
    role: row.role,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getUserById(id: number): Promise<PublicUser> {
  const user = await findUserById(id);
  if (!user) throw new AppError("Usuário não encontrado.", 404);
  return toPublicUser(user);
}

export async function listUsers(): Promise<UserListRow[]> {
  return findAllUsers();
}

export async function updateProfile(
  requesterId: number,
  targetId: number,
  dto: UpdateUserDTO
): Promise<PublicUser> {
  if (requesterId !== targetId) {
    throw new AppError("Você só pode editar o próprio perfil.", 403);
  }
  const existing = await findUserById(targetId);
  if (!existing) throw new AppError("Usuário não encontrado.", 404);

  await updateUser(targetId, dto);
  const updated = await findUserById(targetId);
  return toPublicUser(updated!);
}

export async function changePassword(
  requesterId: number,
  targetId: number,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  if (requesterId !== targetId) {
    throw new AppError("Você só pode alterar a própria senha.", 403);
  }
  const user = await findUserById(targetId);
  if (!user) throw new AppError("Usuário não encontrado.", 404);

  const matches = await bcrypt.compare(currentPassword, user.password_hash);
  if (!matches) throw new AppError("Senha atual incorreta.", 401);

  const hash = await bcrypt.hash(newPassword, 10);
  await updatePassword(targetId, hash);
}

export async function setUserStatus(
  targetId: number,
  status: UserStatus
): Promise<void> {
  const user = await findUserById(targetId);
  if (!user) throw new AppError("Usuário não encontrado.", 404);
  await updateUserStatus(targetId, status);
}

// Assigns or removes the pharmacy a professional belongs to (ADMIN action).
// Pass partnerId = null to unlink.
export async function setPartner(
  targetId: number,
  partnerId: number | null
): Promise<void> {
  const user = await findUserById(targetId);
  if (!user) throw new AppError("Usuário não encontrado.", 404);

  if (partnerId !== null) {
    const partner = await findPartnerById(partnerId);
    if (!partner) throw new AppError("Farmácia parceira não encontrada.", 404);
    if (partner.status !== "ativo") {
      throw new AppError("A farmácia parceira não está ativa.", 422);
    }
  }

  await updateUserPartner(targetId, partnerId);
}
