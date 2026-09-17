import { useState, useEffect, useCallback, useMemo } from 'react';
import { apiClient, mapErrorMessage } from '../lib/api-client';
import { config } from '../lib/config';
import { parseDecimal } from '../lib/format';
import { onRefresh } from '../lib/data-refresh';
import type {
  Wallet,
  Transaction,
  Budget,
  Goal,
} from '../types/common';
import type {
  WalletsResponseData,
  TransactionsResponseData,
  BudgetsResponseData,
  GoalsResponseData,
} from '../types/api';

export interface UseDashboardDataReturn {
  wallets: Wallet[];
  transactions: Transaction[];
  recentTransactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useDashboardData(): UseDashboardDataReturn {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (isRefreshMode: boolean = false) => {
    if (isRefreshMode) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      // Parallel execution using existing apiClient
      const [walletsRes, transactionsRes, budgetsRes, goalsRes] = await Promise.all([
        apiClient.get<WalletsResponseData>(config.endpoints.wallets),
        apiClient.get<TransactionsResponseData>(`${config.endpoints.transactions}?limit=50`),
        apiClient.get<BudgetsResponseData>(config.endpoints.budgets),
        apiClient.get<GoalsResponseData>(config.endpoints.goals),
      ]);

      setWallets(walletsRes?.wallets || []);
      setTransactions(transactionsRes?.transactions || []);
      setBudgets(budgetsRes?.budgets || []);
      setGoals(goalsRes?.goals || []);
    } catch (err: unknown) {
      const friendlyMessage = mapErrorMessage(err);
      setError(friendlyMessage);
    } finally {
      if (isRefreshMode) {
        setIsRefreshing(false);
      } else {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchData(false);
    const unsubscribe = onRefresh(() => {
      fetchData(true);
    });
    return unsubscribe;
  }, [fetchData]);

  const refresh = useCallback(async () => {
    await fetchData(true);
  }, [fetchData]);

  // Deterministic calculation of total balance from actual wallets
  const totalBalance = useMemo(() => {
    return wallets.reduce((acc, wallet) => {
      return acc + parseDecimal(wallet.balance);
    }, 0);
  }, [wallets]);

  // Deterministic calculation of monthly income & expense for the current month
  const { monthlyIncome, monthlyExpense } = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    let income = 0;
    let expense = 0;

    for (const tx of transactions) {
      const txDate = new Date(tx.transactionDate);
      if (
        !isNaN(txDate.getTime()) &&
        txDate.getFullYear() === currentYear &&
        txDate.getMonth() === currentMonth
      ) {
        const amount = parseDecimal(tx.amount);
        if (tx.type === 'INCOME') {
          income += amount;
        } else if (tx.type === 'EXPENSE') {
          expense += amount;
        }
      }
    }

    return { monthlyIncome: income, monthlyExpense: expense };
  }, [transactions]);

  // Recent transactions preview (first 5)
  const recentTransactions = useMemo(() => {
    return transactions.slice(0, 5);
  }, [transactions]);

  return {
    wallets,
    transactions,
    recentTransactions,
    budgets,
    goals,
    totalBalance,
    monthlyIncome,
    monthlyExpense,
    isLoading,
    isRefreshing,
    error,
    refresh,
  };
}

export default useDashboardData;
