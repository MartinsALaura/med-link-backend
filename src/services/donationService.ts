import {
  DonationRow,
  DonationListRow,
  DonationStatus,
  createDonation,
  findDonations,
  findDonationById,
  updateDonationStatus,
  updateDonation,
  deleteDonation,
  UpdateDonationDTO,
} from "../models/donationModel";
import { findUserById } from "../models/userModel";
import { AppError } from "../utils/AppError";
import { base64ToBuffer, bufferToBase64 } from "../utils/base64";

export interface CreateDonationInput {
  name: string;
  activeIngredient: string;
  concentration: string;
  dosageForm: string;
  laboratory: string;
  category: string;
  tarja: string;
  quantity: number;
  lote?: string;
  expirationDate: string;
  description?: string;
  donorAddress: string;
  sealed: boolean;
  originalPackaging: boolean;
  requiresPrescription: boolean;
  photoBase64: string;
  photoName: string;
  photoType: string;
  indication?: string;
  contraindication?: string;
  careNotes?: string;
}

// Public detail shape: BLOBs as base64, pickup point info, no binary leakage.
export interface PublicDonation {
  id: number;
  donorId: number;
  name: string;
  activeIngredient: string;
  concentration: string;
  dosageForm: string;
  laboratory: string;
  category: string;
  tarja: string;
  quantity: number;
  lote: string | null;
  expirationDate: string;
  description: string | null;
  donorAddress: string;
  sealed: boolean;
  originalPackaging: boolean;
  requiresPrescription: boolean;
  photo: string | null;
  photoName: string | null;
  photoType: string | null;
  indication: string | null;
  contraindication: string | null;
  careNotes: string | null;
  status: DonationStatus;
  pickupPointId: number | null;
  pickupPointName: string | null;
  pickupPointAddress: string | null;
  createdAt: string;
  updatedAt: string;
}

function toPublicDonation(row: DonationRow): PublicDonation {
  return {
    id: row.id,
    donorId: row.donor_id,
    name: row.name,
    activeIngredient: row.active_ingredient,
    concentration: row.concentration,
    dosageForm: row.dosage_form,
    laboratory: row.laboratory,
    category: row.category,
    tarja: row.tarja,
    quantity: row.quantity,
    lote: row.lote,
    expirationDate: row.expiration_date,
    description: row.description,
    donorAddress: row.donor_address,
    sealed: !!row.sealed,
    originalPackaging: !!row.original_packaging,
    requiresPrescription: !!row.requires_prescription,
    photo: row.photo && row.photo_type ? bufferToBase64(row.photo, row.photo_type) : null,
    photoName: row.photo_name,
    photoType: row.photo_type,
    indication: row.indication,
    contraindication: row.contraindication,
    careNotes: row.care_notes,
    status: row.status,
    pickupPointId: row.pickup_point_id,
    pickupPointName: row.pickup_point_name ?? null,
    pickupPointAddress: row.pickup_point_address ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function create(
  donorId: number,
  input: CreateDonationInput
): Promise<{ id: number }> {
  // Expiration date must not be in the past.
  const expiration = new Date(input.expirationDate);
  if (Number.isNaN(expiration.getTime())) {
    throw new AppError("Data de validade inválida.", 422);
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (expiration < today) {
    throw new AppError("O medicamento está vencido e não pode ser doado.", 422);
  }

  if (!input.sealed) {
    throw new AppError("O medicamento deve estar lacrado.", 422);
  }
  if (!input.originalPackaging) {
    throw new AppError("O medicamento deve estar na embalagem original.", 422);
  }

  const id = await createDonation({
    donorId,
    name: input.name,
    activeIngredient: input.activeIngredient,
    concentration: input.concentration,
    dosageForm: input.dosageForm,
    laboratory: input.laboratory,
    category: input.category,
    tarja: input.tarja,
    quantity: input.quantity,
    lote: input.lote ?? null,
    expirationDate: input.expirationDate,
    description: input.description ?? null,
    donorAddress: input.donorAddress,
    sealed: input.sealed,
    originalPackaging: input.originalPackaging,
    requiresPrescription: input.requiresPrescription,
    photo: base64ToBuffer(input.photoBase64),
    photoName: input.photoName,
    photoType: input.photoType,
    indication: input.indication ?? null,
    contraindication: input.contraindication ?? null,
    careNotes: input.careNotes ?? null,
  });

  return { id };
}

export async function list(filters: {
  status?: string;
  search?: string;
}): Promise<DonationListRow[]> {
  return findDonations(filters);
}

export async function getById(id: number): Promise<PublicDonation> {
  const donation = await findDonationById(id);
  if (!donation) throw new AppError("Doação não encontrada.", 404);
  return toPublicDonation(donation);
}

// Allowed transitions for the donation state machine.
const DONATION_TRANSITIONS: Record<DonationStatus, DonationStatus[]> = {
  pendente: ["aprovado", "recusado"],
  aprovado: ["concluido"],
  recusado: [],
  concluido: [],
};

export async function updateStatus(
  performerId: number,
  id: number,
  newStatus: DonationStatus
): Promise<PublicDonation> {
  const donation = await findDonationById(id);
  if (!donation) throw new AppError("Doação não encontrada.", 404);

  const allowed = DONATION_TRANSITIONS[donation.status];
  if (!allowed.includes(newStatus)) {
    throw new AppError(
      `Transição de status inválida: ${donation.status} → ${newStatus}.`,
      422
    );
  }

  // When approving, the pickup point is automatically the pharmacy where the
  // approver works (partner_id on their user record). The donor brings the
  // medication to that pharmacy in person, and the pharmacist approves it there.
  let resolvedPickupPoint: number | undefined;
  if (newStatus === "aprovado") {
    const performer = await findUserById(performerId);
    if (!performer?.partner_id) {
      throw new AppError(
        "O usuário responsável pela aprovação não está vinculado a nenhuma farmácia parceira.",
        422
      );
    }
    resolvedPickupPoint = performer.partner_id;
  }

  await updateDonationStatus(id, newStatus, performerId, resolvedPickupPoint);
  const updated = await findDonationById(id);
  return toPublicDonation(updated!);
}

export async function edit(
  id: number,
  dto: UpdateDonationDTO
): Promise<PublicDonation> {
  const donation = await findDonationById(id);
  if (!donation) throw new AppError("Doação não encontrada.", 404);
  await updateDonation(id, dto);
  const updated = await findDonationById(id);
  return toPublicDonation(updated!);
}

export async function remove(requesterId: number, id: number): Promise<void> {
  const donation = await findDonationById(id);
  if (!donation) throw new AppError("Doação não encontrada.", 404);
  if (donation.donor_id !== requesterId) {
    throw new AppError("Você só pode cancelar as próprias doações.", 403);
  }
  await deleteDonation(id);
}
