import { CustomerBalanceChangeHandlerError } from "../domain/error";
import { CustomerBalanceRepositoryError } from "../infra/error";
import { SerializableError } from "../shared/error";

type AppErrorCode =
  | CustomerBalanceChangeHandlerError["code"]
  | CustomerBalanceRepositoryError["code"]
  | "UNHANDLED_ERROR";

export class AppError extends SerializableError<AppErrorCode> {
  constructor(
    public readonly code: AppErrorCode,
    public readonly cause?: unknown,
  ) {
    super(code, { cause });
    this.name = "AppError";
    Error.captureStackTrace(this, AppError);
  }
}
