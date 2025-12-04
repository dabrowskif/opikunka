import { SerializableError } from "../shared/error";

type ErrorCode = "INSUFFICIENT_BALANCE";

export class CustomerBalanceChangeHandlerError extends SerializableError<ErrorCode> {}
