import { CustomerBalanceChangeHandlerError } from "./error";

export type CustomerBalanceChangeEvent =
  | {
      type: "LOW_BALANCE";
      details: {
        customerId: string;
        balance: number;
      };
    }
  | {
      type: "BALANCE_CHANGED";
      details: {
        customerId: string;
        prevBalance: number;
        newBalance: number;
      };
    };

export class CustomerBalanceChangeHandler {
  calculateNewBalance(curr: number, change: number) {
    const newBalance = curr + change;

    if (newBalance < 0) {
      throw new CustomerBalanceChangeHandlerError("INSUFFICIENT_BALANCE", {
        curr,
        desired: newBalance,
      });
    }

    return newBalance;
  }

  handleChange(
    customerId: string,
    balance: {
      new: number;
      prev: number;
    },
  ): CustomerBalanceChangeEvent[] {
    const events: CustomerBalanceChangeEvent[] = [];

    if (balance.new < balance.prev && balance.new < 10) {
      events.push({
        type: "LOW_BALANCE",
        details: {
          customerId,
          balance: balance.new,
        },
      });
    }

    events.push({
      type: "BALANCE_CHANGED",
      details: {
        customerId,
        newBalance: balance.new,
        prevBalance: balance.prev,
      },
    });

    return events;
  }
}
