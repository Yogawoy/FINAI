import { useState, useEffect, useCallback } from 'react';
import { apiClient, mapErrorMessage } from '../lib/api-client';
import { config } from '../lib/config';
import { emitRefresh, onRefresh } from '../lib/data-refresh';
import type {
  Wallet,
  CreateWalletInput,
  UpdateWalletInput,
} from '../types/common';
import type {
  WalletsResponseData,
  SingleWalletResponseData,
} from '../types/api';

export interface UseWalletsReturn {
  wallets: Wallet[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  fetchWallets: (isRefresh?: boolean) => Promise<void>;
  createWallet: (input: CreateWalletInput) => Promise<Wallet>;
  updateWallet: (id: string, input: UpdateWalletInput) => Promise<Wallet>;
  deleteWallet: (id: string) => Promise<void>;
}

export function useWallets(): UseWalletsReturn {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWallets = useCallback(async (isRefresh: boolean = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const res = await apiClient.get<WalletsResponseData>(config.endpoints.wallets);
      setWallets(res?.wallets || []);
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
    fetchWallets(false);

    const unsubscribe = onRefresh((kind) => {
      if (kind === 'wallet' || kind === 'all') {
        fetchWallets(true);
      }
    });

    return unsubscribe;
  }, [fetchWallets]);

  const createWallet = async (input: CreateWalletInput): Promise<Wallet> => {
    const res = await apiClient.post<SingleWalletResponseData>(
      config.endpoints.wallets,
      input
    );

    emitRefresh('wallet');
    return res.wallet;
  };

  const updateWallet = async (id: string, input: UpdateWalletInput): Promise<Wallet> => {
    const res = await apiClient.patch<SingleWalletResponseData>(
      `${config.endpoints.wallets}/${id}`,
      input
    );

    emitRefresh('wallet');
    return res.wallet;
  };

  const deleteWallet = async (id: string): Promise<void> => {
    await apiClient.delete(`${config.endpoints.wallets}/${id}`);

    emitRefresh('wallet');
  };

  return {
    wallets,
    isLoading,
    isRefreshing,
    error,
    fetchWallets,
    createWallet,
    updateWallet,
    deleteWallet,
  };
}

export default useWallets;
