import bcrypt from "bcrypt";
import * as userService from "../../src/services/userService";
import * as userModel from "../../src/models/userModel";

jest.mock("../../src/models/userModel");
jest.mock("bcrypt");

const mockedModel = jest.mocked(userModel);
const mockedBcrypt = jest.mocked(bcrypt);

function fakeUserRow(overrides: Record<string, unknown> = {}): userModel.UserRow {
  return {
    id: 10,
    name: "Ana",
    password_hash: "hashed",
    role: "USER",
    status: "ativo",
    ...overrides,
  } as userModel.UserRow;
}

const updateDto: userModel.UpdateUserDTO = {
  name: "Ana Updated",
  phone: "(51) 90000-0000",
  cep: "93000-000",
  address: "Rua Y",
  number: "10",
  neighborhood: "Centro",
  city: "São Leopoldo",
  state: "RS",
  susCardNumber: "123",
};

describe("userService.getUserById", () => {
  it("returns 404 when not found", async () => {
    mockedModel.findUserById.mockResolvedValue(null);
    await expect(userService.getUserById(10)).rejects.toMatchObject({ statusCode: 404 });
  });
});

describe("userService.updateProfile", () => {
  it("forbids editing another user's profile with 403", async () => {
    await expect(
      userService.updateProfile(10, 99, updateDto)
    ).rejects.toMatchObject({ statusCode: 403 });
    expect(mockedModel.updateUser).not.toHaveBeenCalled();
  });

  it("updates the profile for its owner", async () => {
    mockedModel.findUserById.mockResolvedValue(fakeUserRow());
    await userService.updateProfile(10, 10, updateDto);
    expect(mockedModel.updateUser).toHaveBeenCalledWith(10, updateDto);
  });
});

describe("userService.changePassword", () => {
  it("forbids changing another user's password with 403", async () => {
    await expect(
      userService.changePassword(10, 99, "old", "newpass")
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  it("returns 401 when the current password is wrong", async () => {
    mockedModel.findUserById.mockResolvedValue(fakeUserRow());
    mockedBcrypt.compare.mockResolvedValue(false as never);
    await expect(
      userService.changePassword(10, 10, "wrong", "newpass")
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  it("hashes and stores the new password", async () => {
    mockedModel.findUserById.mockResolvedValue(fakeUserRow());
    mockedBcrypt.compare.mockResolvedValue(true as never);
    mockedBcrypt.hash.mockResolvedValue("new-hash" as never);

    await userService.changePassword(10, 10, "old", "newpass");
    expect(mockedModel.updatePassword).toHaveBeenCalledWith(10, "new-hash");
  });
});
