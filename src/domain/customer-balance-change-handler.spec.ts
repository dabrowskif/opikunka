import { CustomerBalanceChangeHandler } from "./customer-balance-change-handler";

describe("CustomerBalanceChangeHandler", () => {
  let handler: CustomerBalanceChangeHandler;

  beforeEach(() => {
    handler = new CustomerBalanceChangeHandler();
  });

  describe("calculateNewBalance", () => {
    it("should throw INSUFFICIENT_BALANCE when new balance is below zero", () => {
      expect(() => handler.calculateNewBalance(5, -6)).toThrow(
        "INSUFFICIENT_BALANCE",
      );
    });

    type Case = {
      curr: number;
      change: number;
      expected: number;
    };

    it.each<Case>([
      {
        curr: 5,
        change: -5,
        expected: 0,
      },
      {
        curr: 1234,
        change: -1234,
        expected: 0,
      },
      {
        curr: 0,
        change: 1,
        expected: 1,
      },
      {
        curr: 11000,
        change: 0,
        expected: 11000,
      },
    ])(
      "it should return $expected balance for $curr + $change",
      ({ curr, change, expected }) => {
        expect(handler.calculateNewBalance(curr, change)).toEqual(expected);
      },
    );
  });

  describe("handleChange", () => {
    it("should emit LOW_BALANCE when balance drops below 10", () => {
      const events = handler.handleChange("customer1", {
        prev: 20,
        new: 5,
      });

      const low = events.find((e) => e.type === "LOW_BALANCE");

      expect(low!.details.balance).toBe(5);
    });

    it("should NOT emit LOW_BALANCE when earning points", () => {
      const events = handler.handleChange("customer1", {
        prev: 5,
        new: 15,
      });

      const low = events.find((e) => e.type === "LOW_BALANCE");

      expect(low).toBeUndefined();
    });

    it("should always emit BALANCE_CHANGED", () => {
      const events = handler.handleChange("customer1", {
        prev: 10,
        new: 7,
      });

      const change = events.find((e) => e.type === "BALANCE_CHANGED");

      expect(change!.details.prevBalance).toBe(10);
      expect(change!.details.newBalance).toBe(7);
    });
  });
});
