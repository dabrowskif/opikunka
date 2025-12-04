export interface Logger {
  error(msg: string, details?: Record<string, unknown>): void;
  info(msg: string, details?: Record<string, unknown>): void;
  warn(msg: string, details?: Record<string, unknown>): void;
}

export class ConsoleLogger implements Logger {
  error(msg: string, details: Record<string, unknown>) {
    if (details) {
      console.error(msg, details);
    } else {
      console.error(msg);
    }
  }

  info(msg: string, details: Record<string, unknown>) {
    if (details) {
      console.info(msg, details);
    } else {
      console.info(msg);
    }
  }

  warn(msg: string, details: Record<string, unknown>) {
    if (details) {
      console.warn(msg, details);
    } else {
      console.warn(msg);
    }
  }
}
