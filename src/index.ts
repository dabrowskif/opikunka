import { ConsoleLogger } from "./app/logger";
import { ManageCustomerBalanceUseCase } from "./app/manage-customer-balance.use-case";
import { CustomerBalanceChangeHandler } from "./domain/customer-balance-change-handler";
import { InMemoryCustomerBalanceRepository } from "./infra/customer-balance.repository";
import * as readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: `\n> `,
});

const useCase = new ManageCustomerBalanceUseCase(
  new ConsoleLogger(),
  new InMemoryCustomerBalanceRepository(),
  new CustomerBalanceChangeHandler(),
);

console.log("Usage: <cmd> <customerId> <points>");
console.log("Commands: earn, redeem");
console.log("Example: earn customer1 100");
rl.prompt();

rl.on("line", (input: string) => {
  const [action, customerId, points] = input.trim().toLowerCase().split(" ");

  if (action !== "earn" && action !== "redeem") {
    console.error("Available actions: earn, redeem");
    return rl.prompt();
  }

  if (!customerId || customerId.length < 1) {
    console.error("Provide customerId");
    return rl.prompt();
  }

  if (!points || isNaN(Number(points))) {
    console.error("Points must be a number");
    return rl.prompt();
  }
  if (Number(points) < 0) {
    console.error("Points should be a positive number");
    return rl.prompt();
  }

  switch (action) {
    case "earn":
      try {
        useCase.earnPoints(customerId, Number(points));
      } catch (e) {
        console.error(e);
      }
      break;
    case "redeem":
      try {
        useCase.redeemPoints(customerId, Number(points));
      } catch (e) {
        console.error(e);
      }
      break;
    default:
      const ex = (_: never) => {};
      ex(action);
      throw new Error("Unknown action");
  }

  return rl.prompt();
});

rl.on("close", () => {
  process.exit(0);
});
