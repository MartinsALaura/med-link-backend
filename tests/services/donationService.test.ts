import * as donationService from "../../src/services/donationService";
import * as donationModel from "../../src/models/donationModel";
import * as userModel from "../../src/models/userModel";

jest.mock("../../src/models/donationModel");
jest.mock("../../src/models/userModel");

const mockedDonation = jest.mocked(donationModel);
const mockedUser = jest.mocked(userModel);

function futureDate(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
}

function pastDate(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 1);
  return d.toISOString().slice(0, 10);
}

const validInput: donationService.CreateDonationInput = {
  name: "Amoxicilina",
  activeIngredient: "Amoxicilina",
  concentration: "500mg",
  dosageForm: "comprimido",
  laboratory: "TEUTO",
  category: "Antibiótico",
  tarja: "Vermelha",
  quantity: 2,
  expirationDate: futureDate(),
  donorAddress: "Rua X, 123",
  sealed: true,
  originalPackaging: true,
  requiresPrescription: true,
  photoBase64: "data:image/png;base64,YWJj",
  photoName: "med.png",
  photoType: "image/png",
};

function fakeDonationRow(
  overrides: Record<string, unknown> = {}
): donationModel.DonationRow {
  return {
    id: 1,
    donor_id: 10,
    status: "pendente",
    pickup_point_id: null,
    ...overrides,
  } as donationModel.DonationRow;
}

function fakeUserRow(overrides: Record<string, unknown> = {}): userModel.UserRow {
  return {
    id: 1,
    role: "PROFESSIONAL",
    status: "ativo",
    partner_id: null,
    ...overrides,
  } as userModel.UserRow;
}

describe("donationService.create", () => {
  it("rejects an expired medication with 422", async () => {
    await expect(
      donationService.create(10, { ...validInput, expirationDate: pastDate() })
    ).rejects.toMatchObject({ statusCode: 422 });
    expect(mockedDonation.createDonation).not.toHaveBeenCalled();
  });

  it("rejects when not sealed with 422", async () => {
    await expect(
      donationService.create(10, { ...validInput, sealed: false })
    ).rejects.toMatchObject({ statusCode: 422 });
  });

  it("rejects when not in original packaging with 422", async () => {
    await expect(
      donationService.create(10, { ...validInput, originalPackaging: false })
    ).rejects.toMatchObject({ statusCode: 422 });
  });

  it("creates a valid donation", async () => {
    mockedDonation.createDonation.mockResolvedValue(99);
    const result = await donationService.create(10, validInput);
    expect(result).toEqual({ id: 99 });
    expect(mockedDonation.createDonation).toHaveBeenCalledTimes(1);
  });
});

describe("donationService.updateStatus", () => {
  it("rejects an invalid transition (recusado → concluido) with 422", async () => {
    mockedDonation.findDonationById.mockResolvedValue(
      fakeDonationRow({ status: "recusado" })
    );
    await expect(
      donationService.updateStatus(1, 1, "concluido")
    ).rejects.toMatchObject({ statusCode: 422 });
  });

  it("returns 422 when the approver has no pharmacy linked", async () => {
    mockedDonation.findDonationById.mockResolvedValue(
      fakeDonationRow({ status: "pendente" })
    );
    // Approver has no partner_id.
    mockedUser.findUserById.mockResolvedValue(fakeUserRow({ partner_id: null }));
    await expect(
      donationService.updateStatus(1, 1, "aprovado")
    ).rejects.toMatchObject({ statusCode: 422 });
  });

  it("auto-assigns the approver's pharmacy as pickup point", async () => {
    mockedDonation.findDonationById
      .mockResolvedValueOnce(fakeDonationRow({ status: "pendente" }))
      .mockResolvedValueOnce(fakeDonationRow({ status: "aprovado", pickup_point_id: 5 }));
    mockedUser.findUserById.mockResolvedValue(fakeUserRow({ partner_id: 5 }));

    const result = await donationService.updateStatus(1, 1, "aprovado");

    expect(result.status).toBe("aprovado");
    expect(result.pickupPointId).toBe(5);
    expect(mockedDonation.updateDonationStatus).toHaveBeenCalledWith(1, "aprovado", 1, 5);
  });

  it("refuses donation without requiring a pharmacy", async () => {
    mockedDonation.findDonationById
      .mockResolvedValueOnce(fakeDonationRow({ status: "pendente" }))
      .mockResolvedValueOnce(fakeDonationRow({ status: "recusado" }));

    const result = await donationService.updateStatus(1, 1, "recusado");

    expect(result.status).toBe("recusado");
    // No user lookup needed for refusals.
    expect(mockedUser.findUserById).not.toHaveBeenCalled();
  });
});

describe("donationService.remove", () => {
  it("forbids cancelling someone else's donation with 403", async () => {
    mockedDonation.findDonationById.mockResolvedValue(
      fakeDonationRow({ donor_id: 99 })
    );
    await expect(donationService.remove(10, 1)).rejects.toMatchObject({
      statusCode: 403,
    });
    expect(mockedDonation.deleteDonation).not.toHaveBeenCalled();
  });

  it("deletes the donation for its owner", async () => {
    mockedDonation.findDonationById.mockResolvedValue(
      fakeDonationRow({ donor_id: 10 })
    );
    await donationService.remove(10, 1);
    expect(mockedDonation.deleteDonation).toHaveBeenCalledWith(1);
  });
});
