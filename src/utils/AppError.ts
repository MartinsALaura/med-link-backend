// Application-level error carrying an HTTP status code.
// Service-layer throw sites use this; the errorHandler middleware reads statusCode.
export class AppError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
