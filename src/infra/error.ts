import { SerializableError } from "../shared/error";

type ErrorCode = "CUSTOMER_NOT_FOUND";

export class CustomerBalanceRepositoryError extends SerializableError<ErrorCode> {}
