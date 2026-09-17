import { useState, useEffect, useCallback, useMemo } from 'react';
import { apiClient, mapErrorMessage } from '../lib/api-client';
import { config } from '../lib/config';
import { emitRefresh, onRefresh } from '../lib/data-refresh';
import type {
  Transaction,
  TransactionType,
  CreateTransactionInput,
  UpdateTransactionInput,
} from '../types/common';
import type {
  TransactionsResponseData,
  SingleTransactionResponseData,
} from '../types/api';

export type TransactionFilter = 'ALL' | 'INCOME' | 'EXPENSE';

export interface UseTransactionsReturn {
  transactions: Transaction[];
  filteredTransactions: Transaction[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  activeFilter: TransactionFilter;
  setActiveFilter: (filter: TransactionFilter) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  fetchTransactions: (isRefresh?: boolean) => Promise<void>;
  createTransaction: (input: CreateTransactionInput) => Promise<Transaction>;
  updateTransaction: (id: string, input: UpdateTransactionInput) => Promise<Transaction>;
  deleteTransaction: (id: string) => Promise<void>;
}

export function useTransactions(): UseTransactionsReturn {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [activeFilter, setActiveFilter] = useState<TransactionFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchTransactions = useCallback(async (isRefresh: boolean = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const res = await apiClient.get<TransactionsResponseData>(
        `${config.endpoints.transactions}?limit=100`
      );
      setTransactions(res?.transactions || []);
    } catch (err: unknown) {
      setError(mapErrorMessage(err));
    } finally {
      if (isRefresh) {
        setIsRefreshing(false);
      } else {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchTransactions(false);

    const unsubscribe = onRefresh((kind) => {
      if (kind === 'transaction' || kind === 'all') {
        fetchTransactions(true);
      }
    });

    return unsubscribe;
  }, [fetchTransactions]);

  // Client-side filtering by type and search keyword
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // 1. Type filter
      if (activeFilter !== 'ALL' && tx.type !== activeFilter) {
        return false;
      }

      // 2. Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const descMatch = tx.description.toLowerCase().includes(query);
        const catMatch = tx.category.toLowerCase().includes(query);
        const walletMatch = tx.wallet?.name.toLowerCase().includes(query);
        if (!descMatch && !catMatch && !walletMatch) {
          return false;
        }
      }

      return true;
    });
  }, [transactions, activeFilter, searchQuery]);

  const createTransaction = async (input: CreateTransactionInput): Promise<Transaction> => {
    const res = await apiClient.post<SingleTransactionResponseData>(
      config.endpoints.transactions,
      input
    );

    // Emit event to update all listeners (dashboard, wallets, transactions)
    emitRefresh('transaction');
    emitRefresh('wallet');

    return res.transaction;
  };

  const updateTransaction = async (
    id: string,
    input: UpdateTransactionInput
  ): Promise<Transaction> => {
    const res = await apiClient.patch<SingleTransactionResponseData>(
      `${config.endpoints.transactions}/${id}`,
      input
    );

    emitRefresh('transaction');
    emitRefresh('wallet');

    return res.transaction;
  };

  const deleteTransaction = async (id: string): Promise<void> => {
    await apiClient.delete(`${config.endpoints.transactions}/${id}`);

    emitRefresh('transaction');
    emitRefresh('wallet');
  };

  return {
    transactions,
    filteredTransactions,
    isLoading,
    isRefreshing,
    error,
    activeFilter,
    setActiveFilter,
    searchQuery,
    setSearchQuery,
    fetchTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  };
}

export default useTransactions;
