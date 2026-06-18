import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import {
  createUser,
  findUserByEmail,
  findUserByCpf,
  findUserById,
  Role,
} from "../models/userModel";
import { AppError } from "../utils/AppError";
import { base64ToBuffer } from "../utils/base64";
import { env } from "../config/env";
import { PublicUser, toPublicUser } from "./userService";

export interface RegisterDTO {
  name: string;
  cpf: string;
  birthDate: string;
  phone: string;
  email: string;
  password: string;
  cep: string;
  address: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  susCardNumber: string;
  identityDocumentBase64: string;
  identityDocumentName: string;
  identityDocumentType: string;
  photoBase64?: string;
  photoName?: string;
  photoType?: string;
}

function signToken(id: number, role: Role): string {
  const options: SignOptions = {
    expiresIn: env.jwt.expiresIn as SignOptions["expiresIn"],
  };
  return jwt.sign({ sub: id, role }, env.jwt.secret, options);
}

export async function register(dto: RegisterDTO): Promise<{ id: number }> {
  if (await findUserByEmail(dto.email)) {
    throw new AppError("E-mail já cadastrado.", 409);
  }
  if (await findUserByCpf(dto.cpf)) {
    throw new AppError("CPF já cadastrado.", 409);
  }

  const passwordHash = await bcrypt.hash(dto.password, 10);

  const id = await createUser({
    name: dto.name,
    cpf: dto.cpf,
    birthDate: dto.birthDate,
    phone: dto.phone,
    email: dto.email,
    passwordHash,
    cep: dto.cep,
    address: dto.address,
    number: dto.number,
    complement: dto.complement ?? null,
    neighborhood: dto.neighborhood,
    city: dto.city,
    state: dto.state,
    identityDocument: base64ToBuffer(dto.identityDocumentBase64),
    identityDocumentName: dto.identityDocumentName,
    identityDocumentType: dto.identityDocumentType,
    susCardNumber: dto.susCardNumber,
    photo: dto.photoBase64 ? base64ToBuffer(dto.photoBase64) : null,
    photoName: dto.photoName ?? null,
    photoType: dto.photoType ?? null,
  });

  return { id };
}

export async function login(
  email: string,
  password: string
): Promise<{ token: string }> {
  const user = await findUserByEmail(email);
  if (!user) throw new AppError("E-mail ou senha inválidos.", 401);

  if (user.status === "bloqueado") {
    throw new AppError("Usuário bloqueado. Entre em contato com o suporte.", 403);
  }

  const matches = await bcrypt.compare(password, user.password_hash);
  if (!matches) throw new AppError("E-mail ou senha inválidos.", 401);

  return { token: signToken(user.id, user.role) };
}

export async function getMe(userId: number): Promise<PublicUser> {
  const user = await findUserById(userId);
  if (!user) throw new AppError("Usuário não encontrado.", 404);
  return toPublicUser(user);
}
