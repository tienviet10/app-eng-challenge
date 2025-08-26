import * as businessService from "./businessService";
import * as graphRepo from "../repositories/graphRepository";
import {
  Transaction,
  CreateTransactionDto,
  TransactionWithBusinessName,
} from "../types";
import { convertBusinessEntityToBusinessMap } from "../utils/businessMapping";

/**
  It is NOT a good practice to have a state server.
  The stateless server would required to replace this by Redis (in-memory storage type)
  Calling database could take times (e.g. enrichTransaction method)
*/
let idsToBusinessesMap: Map<string, string>;

/**
 * populate cache
 */
const populateCache = async () => {
  if (!idsToBusinessesMap) {
    const businesses = await businessService.getAllBusinesses();
    idsToBusinessesMap = convertBusinessEntityToBusinessMap(businesses);
  }
};

/**
 * Get all transactions with optional filtering
 */
export const getAllTransactions = async (
  from?: string,
  to?: string
): Promise<TransactionWithBusinessName[]> => {
  await populateCache();

  const transactionData = await graphRepo.findAllEdges(from, to);

  return transactionData.map((transaction) => ({
    ...transaction,
    from_business: idsToBusinessesMap.get(transaction.from),
    to_business: idsToBusinessesMap.get(transaction.to),
  }));
};

/**
 * Get filtered transactions by various criteria
 */
export const getFilteredTransactions = async (
  from?: string,
  to?: string,
  startDate?: string,
  endDate?: string,
  minAmount?: string,
  maxAmount?: string
): Promise<Transaction[]> => {
  return await graphRepo.findFilteredEdges(
    from,
    to,
    startDate,
    endDate,
    minAmount,
    maxAmount
  );
};

/**
 * Create a new transaction between two businesses
 */
export const createTransaction = async (
  dto: CreateTransactionDto
): Promise<TransactionWithBusinessName> => {
  await populateCache();

  const transaction = await graphRepo.createEdge(
    dto.from,
    dto.to,
    dto.amount,
    dto.timestamp
  );

  return {
    ...transaction,
    from_business: idsToBusinessesMap.get(transaction.from),
    to_business: idsToBusinessesMap.get(transaction.to),
  };
};

/**
 * Enrich transaction data with business names for notifications
 */
export const enrichTransaction = async (
  dto: CreateTransactionDto
): Promise<Transaction> => {
  const businesses = await businessService.getBusinessesByIds([
    dto.from,
    dto.to,
  ]);
  const businessMap = new Map(businesses.map((b) => [b.business_id, b]));

  return {
    from: businessMap.get(dto.from)?.name || dto.from,
    to: businessMap.get(dto.to)?.name || dto.to,
    amount: dto.amount,
    timestamp: dto.timestamp,
  };
};
