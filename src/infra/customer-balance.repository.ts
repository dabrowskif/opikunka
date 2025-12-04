import { CustomerBalanceRepositoryError } from "./error";

export interface CustomerBalanceRepository {
  get(customerId: string): number;
  change(customerId: string, points: number): void;
}

export class InMemoryCustomerBalanceRepository
  implements CustomerBalanceRepository
{
  /*
   * Hardcoded CustomerId => CustomerPoints map
   */
  private readonly db = new Map<string, number>([
    ["customer1", 100],
    ["customer2", 50],
    ["customer3", 10],
    ["customer4", 0],
  ]);

  get(customerId: string): number {
    const balance = this.db.get(customerId);

    if (balance === undefined) {
      throw new CustomerBalanceRepositoryError("CUSTOMER_NOT_FOUND");
    }

    return balance;
  }

  // optionally use decrease+increase instead of single change method
  change(customerId: string, newBalance: number) {
    if (!this.db.has(customerId)) {
      throw new CustomerBalanceRepositoryError("CUSTOMER_NOT_FOUND");
    }
    this.db.set(customerId, newBalance);
  }
}
