import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as authService from "../../src/services/authService";
import * as userModel from "../../src/models/userModel";
import { AppError } from "../../src/utils/AppError";

jest.mock("../../src/models/userModel");
jest.mock("bcrypt");
jest.mock("jsonwebtoken");

const mockedModel = jest.mocked(userModel);
const mockedBcrypt = jest.mocked(bcrypt);
const mockedJwt = jest.mocked(jwt);

const baseRegisterInput: authService.RegisterDTO = {
  name: "Ana Silva",
  cpf: "000.000.000-00",
  birthDate: "1990-05-12",
  phone: "(51) 99999-8888",
  email: "ana@email.com",
  password: "senha123",
  cep: "93000-000",
  address: "Rua das Flores",
  number: "123",
  neighborhood: "Centro",
  city: "São Leopoldo",
  state: "RS",
  susCardNumber: "123456789012345",
  identityDocumentBase64: "data:image/png;base64,YWJj",
  identityDocumentName: "rg.png",
  identityDocumentType: "image/png",
};

function fakeUserRow(overrides: Record<string, unknown> = {}): userModel.UserRow {
  return {
    id: 1,
    role: "USER",
    status: "ativo",
    password_hash: "hashed",
    email: "ana@email.com",
    ...overrides,
  } as userModel.UserRow;
}

describe("authService.register", () => {
  it("rejects a duplicate e-mail with 409", async () => {
    mockedModel.findUserByEmail.mockResolvedValue(fakeUserRow());

    await expect(authService.register(baseRegisterInput)).rejects.toMatchObject({
      statusCode: 409,
    });
    expect(mockedModel.createUser).not.toHaveBeenCalled();
  });

  it("rejects a duplicate CPF with 409", async () => {
    mockedModel.findUserByEmail.mockResolvedValue(null);
    mockedModel.findUserByCpf.mockResolvedValue(fakeUserRow());

    await expect(authService.register(baseRegisterInput)).rejects.toBeInstanceOf(
      AppError
    );
    expect(mockedModel.createUser).not.toHaveBeenCalled();
  });

  it("hashes the password and stores the identity document as a Buffer", async () => {
    mockedModel.findUserByEmail.mockResolvedValue(null);
    mockedModel.findUserByCpf.mockResolvedValue(null);
    mockedBcrypt.hash.mockResolvedValue("hashed-pw" as never);
    mockedModel.createUser.mockResolvedValue(7);

    const result = await authService.register(baseRegisterInput);

    expect(result).toEqual({ id: 7 });
    const dto = mockedModel.createUser.mock.calls[0][0];
    expect(dto.passwordHash).toBe("hashed-pw");
    expect(Buffer.isBuffer(dto.identityDocument)).toBe(true);
  });
});

describe("authService.login", () => {
  it("returns 401 when the user does not exist", async () => {
    mockedModel.findUserByEmail.mockResolvedValue(null);
    await expect(authService.login("x@x.com", "pw")).rejects.toMatchObject({
      statusCode: 401,
    });
  });

  it("returns 403 when the user is blocked", async () => {
    mockedModel.findUserByEmail.mockResolvedValue(fakeUserRow({ status: "bloqueado" }));
    await expect(authService.login("ana@email.com", "pw")).rejects.toMatchObject({
      statusCode: 403,
    });
  });

  it("returns 401 when the password does not match", async () => {
    mockedModel.findUserByEmail.mockResolvedValue(fakeUserRow());
    mockedBcrypt.compare.mockResolvedValue(false as never);
    await expect(authService.login("ana@email.com", "wrong")).rejects.toMatchObject({
      statusCode: 401,
    });
  });

  it("returns a signed token on success", async () => {
    mockedModel.findUserByEmail.mockResolvedValue(fakeUserRow());
    mockedBcrypt.compare.mockResolvedValue(true as never);
    mockedJwt.sign.mockReturnValue("signed-token" as never);

    const result = await authService.login("ana@email.com", "senha123");

    expect(result).toEqual({ token: "signed-token" });
    expect(mockedJwt.sign).toHaveBeenCalledWith(
      { sub: 1, role: "USER" },
      expect.any(String),
      expect.any(Object)
    );
  });
});
