import { describe, expect, it, jest } from "@jest/globals";
import { Request, Response } from "express";
import { requireRole } from "../../src/middlewares/requireRole";
import { AppError } from "../../src/utils/AppError";

function runWith(role: string | undefined, ...allowed: ("USER" | "PROFESSIONAL" | "ADMIN")[]) {
  const req = { user: role ? { id: 1, role } : undefined } as unknown as Request;
  const next = jest.fn();
  requireRole(...allowed)(req, {} as Response, next);
  return next;
}

describe("requireRole", () => {
  it("calls next() when the role is allowed", () => {
    const next = runWith("ADMIN", "ADMIN");
    expect(next).toHaveBeenCalledWith();
  });

  it("throws 403 when the role is not allowed", () => {
    expect(() => runWith("USER", "ADMIN")).toThrow(AppError);
  });

  it("throws 403 when there is no authenticated user", () => {
    expect(() => runWith(undefined, "ADMIN")).toThrow(
      expect.objectContaining({ statusCode: 403 })
    );
  });

  it("accepts any of several allowed roles", () => {
    const next = runWith("PROFESSIONAL", "PROFESSIONAL", "ADMIN");
    expect(next).toHaveBeenCalledWith();
  });
});
