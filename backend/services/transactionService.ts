import * as businessService from './businessService';
import * as graphRepo from '../repositories/graphRepository';
import type { Transaction, CreateTransactionDto, TransactionWithBusinessName } from '../types';
import * as graphService from './graphService';
/**
 * Get all transactions with optional filtering
 */
export const getAllTransactions = async (from?: string, to?: string): Promise<TransactionWithBusinessName[]> => {
  const { nameMap } = await graphService.getEnrichedGraphData();

  const allEdges = await graphRepo.findAllEdges(from, to);

  return allEdges.map(edge => ({
    ...edge,
    from_business: nameMap[edge.from] || edge.from,
    to_business: nameMap[edge.to] || edge.to,
  }))
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
export const createTransaction = async (dto: CreateTransactionDto): Promise<Transaction> => {
    return await graphRepo.createEdge(
        dto.from,
        dto.to,
        dto.amount,
        dto.timestamp
    );
};

/**
 * Enrich transaction data with business names for notifications
 */
export const enrichTransaction = async (dto: CreateTransactionDto): Promise<Transaction> => {
    const businesses = await businessService.getBusinessesByIds([dto.from, dto.to]);
    const businessMap = new Map(businesses.map(b => [b.business_id, b]));
    
    return {
        from: businessMap.get(dto.from)?.name || dto.from,
        to: businessMap.get(dto.to)?.name || dto.to,
        amount: dto.amount,
        timestamp: dto.timestamp
    };
};