import {
  RequestRow,
  RequestStatus,
  createRequest,
  findRequestsByUser,
  findRequestById,
  updateRequestStatus,
} from "../models/requestModel";
import { findDonationById } from "../models/donationModel";
import { Role } from "../models/userModel";
import { AppError } from "../utils/AppError";

const CANCELLATION_WINDOW_MS = 5 * 60 * 60 * 1000; // 5 hours

export async function create(
  beneficiaryId: number,
  donationId: number
): Promise<{ id: number }> {
  const donation = await findDonationById(donationId);
  if (!donation) throw new AppError("Doação não encontrada.", 404);
  if (donation.status !== "aprovado") {
    throw new AppError("Este medicamento não está disponível para solicitação.", 422);
  }
  const id = await createRequest(beneficiaryId, donationId);
  return { id };
}

export async function listByUser(userId: number): Promise<RequestRow[]> {
  return findRequestsByUser(userId);
}

export async function getById(
  requesterId: number,
  requesterRole: Role,
  id: number
): Promise<RequestRow> {
  const request = await findRequestById(id);
  if (!request) throw new AppError("Solicitação não encontrada.", 404);
  const isOwner = request.beneficiary_id === requesterId;
  const isStaff = requesterRole === "PROFESSIONAL" || requesterRole === "ADMIN";
  if (!isOwner && !isStaff) {
    throw new AppError("Acesso negado.", 403);
  }
  return request;
}

// Allowed transitions for the request state machine (staff-driven).
const REQUEST_TRANSITIONS: Record<RequestStatus, RequestStatus[]> = {
  pendente: ["aprovado", "recusado"],
  aprovado: ["entregue"],
  recusado: [],
  entregue: [],
  cancelado: [],
};

export async function updateStatus(
  id: number,
  newStatus: RequestStatus
): Promise<RequestRow> {
  const request = await findRequestById(id);
  if (!request) throw new AppError("Solicitação não encontrada.", 404);

  const allowed = REQUEST_TRANSITIONS[request.status];
  if (!allowed.includes(newStatus)) {
    throw new AppError(
      `Transição de status inválida: ${request.status} → ${newStatus}.`,
      422
    );
  }

  await updateRequestStatus(id, newStatus);
  return (await findRequestById(id))!;
}

export async function cancel(requesterId: number, id: number): Promise<void> {
  const request = await findRequestById(id);
  if (!request) throw new AppError("Solicitação não encontrada.", 404);
  if (request.beneficiary_id !== requesterId) {
    throw new AppError("Você só pode cancelar as próprias solicitações.", 403);
  }
  if (request.status !== "pendente") {
    throw new AppError("Apenas solicitações pendentes podem ser canceladas.", 422);
  }

  const elapsed = Date.now() - new Date(request.requested_at).getTime();
  if (elapsed > CANCELLATION_WINDOW_MS) {
    throw new AppError("O prazo de 5 horas para cancelamento já expirou.", 403);
  }

  await updateRequestStatus(id, "cancelado");
}
