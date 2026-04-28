export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 400,
    public code?: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class ConflictError extends AppError {
  constructor(message: string, code?: string) {
    super(message, 409, code || "CONFLICT");
    this.name = "ConflictError";
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, code?: string) {
    super(message, 404, code || "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string, code?: string) {
    super(message, 401, code || "UNAUTHORIZED");
    this.name = "UnauthorizedError";
  }
}
