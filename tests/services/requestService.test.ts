import * as requestService from "../../src/services/requestService";
import * as requestModel from "../../src/models/requestModel";
import * as donationModel from "../../src/models/donationModel";

jest.mock("../../src/models/requestModel");
jest.mock("../../src/models/donationModel");

const mockedRequest = jest.mocked(requestModel);
const mockedDonation = jest.mocked(donationModel);

function fakeRequestRow(
  overrides: Record<string, unknown> = {}
): requestModel.RequestRow {
  return {
    id: 1,
    beneficiary_id: 10,
    donation_id: 42,
    status: "pendente",
    requested_at: new Date().toISOString(),
    ...overrides,
  } as requestModel.RequestRow;
}

function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

describe("requestService.create", () => {
  it("rejects a request for a non-approved donation with 422", async () => {
    mockedDonation.findDonationById.mockResolvedValue({
      id: 42,
      status: "pendente",
    } as donationModel.DonationRow);

    await expect(requestService.create(10, 42)).rejects.toMatchObject({
      statusCode: 422,
    });
    expect(mockedRequest.createRequest).not.toHaveBeenCalled();
  });

  it("returns 404 when the donation does not exist", async () => {
    mockedDonation.findDonationById.mockResolvedValue(null);
    await expect(requestService.create(10, 42)).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it("creates a request for an approved donation", async () => {
    mockedDonation.findDonationById.mockResolvedValue({
      id: 42,
      status: "aprovado",
    } as donationModel.DonationRow);
    mockedRequest.createRequest.mockResolvedValue(5);

    const result = await requestService.create(10, 42);
    expect(result).toEqual({ id: 5 });
  });
});

describe("requestService.cancel", () => {
  it("forbids cancelling another user's request with 403", async () => {
    mockedRequest.findRequestById.mockResolvedValue(
      fakeRequestRow({ beneficiary_id: 99 })
    );
    await expect(requestService.cancel(10, 1)).rejects.toMatchObject({
      statusCode: 403,
    });
  });

  it("rejects cancelling a non-pending request with 422", async () => {
    mockedRequest.findRequestById.mockResolvedValue(
      fakeRequestRow({ status: "aprovado" })
    );
    await expect(requestService.cancel(10, 1)).rejects.toMatchObject({
      statusCode: 422,
    });
  });

  it("rejects cancellation after the 5-hour window with 403", async () => {
    mockedRequest.findRequestById.mockResolvedValue(
      fakeRequestRow({ requested_at: hoursAgo(6) })
    );
    await expect(requestService.cancel(10, 1)).rejects.toMatchObject({
      statusCode: 403,
    });
    expect(mockedRequest.updateRequestStatus).not.toHaveBeenCalled();
  });

  it("cancels within the 5-hour window", async () => {
    mockedRequest.findRequestById.mockResolvedValue(
      fakeRequestRow({ requested_at: hoursAgo(4) })
    );
    await requestService.cancel(10, 1);
    expect(mockedRequest.updateRequestStatus).toHaveBeenCalledWith(1, "cancelado");
  });
});

describe("requestService.updateStatus", () => {
  it("rejects an invalid transition (pendente → entregue) with 422", async () => {
    mockedRequest.findRequestById.mockResolvedValue(fakeRequestRow({ status: "pendente" }));
    await expect(requestService.updateStatus(1, "entregue")).rejects.toMatchObject({
      statusCode: 422,
    });
  });

  it("allows aprovado → entregue", async () => {
    mockedRequest.findRequestById
      .mockResolvedValueOnce(fakeRequestRow({ status: "aprovado" }))
      .mockResolvedValueOnce(fakeRequestRow({ status: "entregue" }));
    const result = await requestService.updateStatus(1, "entregue");
    expect(result.status).toBe("entregue");
    expect(mockedRequest.updateRequestStatus).toHaveBeenCalledWith(1, "entregue");
  });
});
