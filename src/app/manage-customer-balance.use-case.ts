import {
  CustomerBalanceChangeEvent,
  CustomerBalanceChangeHandler,
} from "../domain/customer-balance-change-handler";
import { CustomerBalanceRepository } from "../infra/customer-balance.repository";
import { SerializableError } from "../shared/error";
import { AppError } from "./error";
import { Logger } from "./logger";

export class ManageCustomerBalanceUseCase {
  constructor(
    private readonly logger: Logger,
    private readonly balanceRepository: CustomerBalanceRepository,
    private readonly balanceChangeHandler: CustomerBalanceChangeHandler,
  ) {}

  redeemPoints(customerId: string, points: number) {
    try {
      const change = -points;

      const currBalance = this.balanceRepository.get(customerId);
      const newBalance = this.balanceChangeHandler.calculateNewBalance(
        currBalance,
        change,
      );

      // Race condition here, we can have new balance already set up in between.
      // Should be handled with i.e. some optimistic lock / transaction with row lock

      this.balanceRepository.change(customerId, newBalance);

      const events = this.balanceChangeHandler.handleChange(customerId, {
        new: newBalance,
        prev: currBalance,
      });

      this.emitEvents(events);
    } catch (e) {
      if (e instanceof SerializableError) {
        throw new AppError(e.code, { cause: e });
      }
      throw new AppError("UNHANDLED_ERROR", { cause: e });
    }
  }

  earnPoints(customerId: string, points: number) {
    try {
      const change = points;
      const currBalance = this.balanceRepository.get(customerId);

      const newBalance = this.balanceChangeHandler.calculateNewBalance(
        currBalance,
        change,
      );

      // Race condition here, we can have new balance already set up in between.
      // Should be handled with i.e. some optimistic lock / transaction with row lock

      this.balanceRepository.change(customerId, newBalance);

      const events = this.balanceChangeHandler.handleChange(customerId, {
        new: newBalance,
        prev: currBalance,
      });

      this.emitEvents(events);
    } catch (e) {
      const msg = e instanceof SerializableError ? e.code : "UNHANDLED_ERROR";
      throw new AppError(msg, { cause: e });
    }
  }

  private emitEvents(events: CustomerBalanceChangeEvent[]) {
    for (const event of events) {
      switch (event.type) {
        case "LOW_BALANCE":
          this.logger.warn(
            `Warning: Customer ${event.details.customerId} has a low balance: ${event.details.balance} points.`,
          );
          break;
        case "BALANCE_CHANGED":
          this.logger.info(
            `Customer ${event.details.customerId} balance changed from ${event.details.prevBalance} to ${event.details.newBalance}`,
          );
          break;
        default:
          const ex = (_: never) => {};
          ex(event);
          this.logger.error("Uhandled balance change event", event);
      }
    }
  }
}
