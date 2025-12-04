export class SerializableError<ErrorCode extends string> extends Error {
  constructor(
    public readonly code: ErrorCode,
    public readonly cause?: unknown,
  ) {
    super(code, { cause });
    this.name = this.constructor.name;
  }

  serialize() {
    return {
      error: this.name,
      code: this.code,
      cause: this.cause,
    };
  }
}
