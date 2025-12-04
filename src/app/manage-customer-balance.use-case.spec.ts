import { MockedObject } from "vitest";
import { ManageCustomerBalanceUseCase } from "./manage-customer-balance.use-case";
import { Logger } from "./logger";
import { CustomerBalanceRepository } from "../infra/customer-balance.repository";
import { CustomerBalanceChangeHandler } from "../domain/customer-balance-change-handler";
import { SerializableError } from "../shared/error";
import { AppError } from "./error";

describe("ManageCustomerBalanceUseCase", () => {
  let useCase: ManageCustomerBalanceUseCase;

  const mocks: {
    logger: MockedObject<Logger>;
    repo: MockedObject<CustomerBalanceRepository>;
    handler: MockedObject<CustomerBalanceChangeHandler>;
  } = {
    logger: {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    },
    repo: {
      change: vi.fn(),
      get: vi.fn(),
    },
    handler: {
      calculateNewBalance: vi.fn(),
      handleChange: vi.fn(),
    },
  };

  beforeEach(() => {
    useCase = new ManageCustomerBalanceUseCase(
      mocks.logger,
      mocks.repo,
      mocks.handler,
    );

    vi.resetAllMocks();
  });

  describe("earnPoints", () => {
    describe("event handling", () => {
      it("should log BALANCE_CHANGED event", () => {
        mocks.repo.get.mockReturnValue(100);
        mocks.handler.calculateNewBalance.mockReturnValue(120);
        mocks.handler.handleChange.mockReturnValue([
          {
            type: "BALANCE_CHANGED",
            details: {
              customerId: "customer1",
              prevBalance: 100,
              newBalance: 120,
            },
          },
        ]);

        useCase.earnPoints("customer1", 20);

        expect(mocks.repo.get).toHaveBeenCalledWith("customer1");
        expect(mocks.handler.calculateNewBalance).toHaveBeenCalledWith(100, 20);
        expect(mocks.repo.change).toHaveBeenCalledWith("customer1", 120);
        expect(mocks.logger.info).toHaveBeenCalled();
      });

      describe("error handling", () => {
        it("should wrap SerializableError as AppError", () => {
          const err = new SerializableError("INSUFFICIENT_BALANCE");
          mocks.handler.calculateNewBalance.mockImplementation(() => {
            throw err;
          });
          mocks.repo.get.mockReturnValue(20);

          expect(() => useCase.redeemPoints("customer1", 30)).toThrow(AppError);
        });

        it("shoudl wrap unknown error as UNHANDLED_ERROR", () => {
          mocks.repo.get.mockReturnValue(100);
          mocks.handler.calculateNewBalance.mockRejectedValueOnce(
            new Error("UNKNOWN"),
          );

          try {
            useCase.redeemPoints("customer1", 100);
          } catch (e) {
            expect(e).toBeInstanceOf(AppError);
            expect((e as AppError).code).toBe("UNHANDLED_ERROR");
          }
        });
      });
    });

    describe("redeemPoints", () => {
      it("should log LOW_BALANCE event", () => {
        mocks.repo.get.mockReturnValue(100);
        mocks.handler.calculateNewBalance.mockReturnValue(91);
        mocks.handler.handleChange.mockReturnValue([
          {
            type: "LOW_BALANCE",
            details: { customerId: "customer1", balance: 9 },
          },
        ]);

        useCase.redeemPoints("customer1", 9);

        expect(mocks.logger.warn).toHaveBeenCalled();
      });
    });
  });
});
