'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Wallet as WalletIcon,
  Plus,
  Building2,
  Banknote,
  PiggyBank,
  Eye,
  EyeOff,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { Wallet, Transaction } from '@/types';
import { formatIDR } from '@/lib/format';
import { apiClient, mapApiErrorMessage } from '@/lib/api-client';
import { emitRefresh, onRefresh } from '@/lib/data-refresh';

// Loading & Page Transition
import WalletsSkeleton from '@/components/loading/WalletsSkeleton';
import PageTransition from '@/components/loading/PageTransition';

// Subkomponen Modular Wallets
import WalletCard from '@/components/wallets/WalletCard';
import AddWalletCard from '@/components/wallets/AddWalletCard';
import AddWalletModal from '@/components/wallets/AddWalletModal';
import WalletPreviewModal from '@/components/wallets/WalletPreviewModal';
import EditWalletModal from '@/components/wallets/EditWalletModal';
import WalletDetailModal from '@/components/wallets/WalletDetailModal';
import DeleteWalletModal from '@/components/wallets/DeleteWalletModal';
import WalletSuccessModal from '@/components/wallets/WalletSuccessModal';
import TransactionToast from '@/components/transactions/TransactionToast';

// Adapter to transform backend DB wallet to UI Wallet type
function mapBackendWalletToUI(w: any): Wallet {
  const backendType = String(w.type).toUpperCase();
  let type: Wallet['type'] = 'bank';
  if (backendType === 'E_WALLET') type = 'ewallet';
  else if (backendType === 'CASH') type = 'cash';
  else if (backendType === 'BANK') type = 'bank';

  return {
    id: w.id,
    name: w.name,
    type,
    balance: Number(w.balance),
    currency: 'IDR',
    icon: w.icon || (type === 'ewallet' ? 'Wallet' : type === 'cash' ? 'Cash' : 'Bank'),
    accountIdentifier: w.accountLast4 ? `•••• ${w.accountLast4}` : undefined,
    holderName: w.institution || undefined,
    colorTheme: (w.color || (type === 'ewallet' ? 'blue' : type === 'cash' ? 'mint' : 'periwinkle')) as any,
    isDefault: false,
    isArchived: false,
  };
}

export default function WalletsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isMasked, setIsMasked] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [lastCreatedWallet, setLastCreatedWallet] = useState<Wallet | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const fetchWallets = useCallback(async () => {
    try {
      setErrorMessage(null);
      const res = await apiClient.get<{ wallets: any[] }>('/api/wallets');
      const mapped = (res.wallets || []).map(mapBackendWalletToUI);
      setWallets(mapped);
    } catch (err) {
      setErrorMessage(mapApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchTransactions = useCallback(async () => {
    try {
      const res = await apiClient.get<{ transactions: any[] }>('/api/transactions');
      // UI transactions mapping if needed
    } catch {
      // Ignore background tx error
    }
  }, []);

  useEffect(() => {
    fetchWallets();
    fetchTransactions();
  }, [fetchWallets, fetchTransactions]);

  useEffect(() => {
    const off = onRefresh((kind) => {
      if (kind === 'wallet' || kind === 'transfer' || kind === 'transaction' || kind === 'goal_contribution' || kind === 'all') {
        fetchWallets();
      }
    });
    return off;
  }, [fetchWallets]);

  const activeWallets = useMemo(() => {
    return wallets.filter((w) => !w.isArchived);
  }, [wallets]);

  const totalBalance = useMemo(() => {
    return activeWallets.reduce((acc, curr) => acc + curr.balance, 0);
  }, [activeWallets]);

  const bankTotal = useMemo(
    () => activeWallets.filter((w) => w.type === 'bank').reduce((acc, c) => acc + c.balance, 0),
    [activeWallets]
  );
  const cashTotal = useMemo(
    () => activeWallets.filter((w) => w.type === 'cash').reduce((acc, c) => acc + c.balance, 0),
    [activeWallets]
  );
  const ewalletTotal = useMemo(
    () => activeWallets.filter((w) => w.type === 'ewallet').reduce((acc, c) => acc + c.balance, 0),
    [activeWallets]
  );
  const savingsTotal = useMemo(
    () => activeWallets.filter((w) => w.type === 'savings' || w.type === 'investment').reduce((acc, c) => acc + c.balance, 0),
    [activeWallets]
  );

  const handleAddWalletSubmit = async (walletData: {
    name: string;
    type: string;
    institution?: string;
    accountLast4?: string;
    balance: number;
    color?: string;
    icon?: string;
  }) => {
    try {
      let backendType = 'BANK';
      if (walletData.type === 'ewallet') backendType = 'E_WALLET';
      else if (walletData.type === 'cash') backendType = 'CASH';

      const res = await apiClient.post<{ wallet: any }>('/api/wallets', {
        name: walletData.name,
        type: backendType,
        institution: walletData.institution || null,
        accountLast4: walletData.accountLast4 || null,
        balance: walletData.balance,
        color: walletData.color || null,
        icon: walletData.icon || null,
      });

      const newUiWallet = mapBackendWalletToUI(res.wallet);
      setLastCreatedWallet(newUiWallet);
      setIsSuccessModalOpen(true);
      showToast(`${newUiWallet.name} berhasil ditambahkan.`);
      fetchWallets();
      emitRefresh('wallet');
    } catch (err) {
      showToast(mapApiErrorMessage(err));
    }
  };

  const handleUpdateWalletSubmit = async (updated: {
    id: string;
    name: string;
    type: string;
    institution?: string;
    accountLast4?: string;
    color?: string;
    icon?: string;
  }) => {
    try {
      let backendType = 'BANK';
      if (updated.type === 'ewallet') backendType = 'E_WALLET';
      else if (updated.type === 'cash') backendType = 'CASH';

      const res = await apiClient.patch<{ wallet: any }>(`/api/wallets/${updated.id}`, {
        name: updated.name,
        type: backendType,
        institution: updated.institution || null,
        accountLast4: updated.accountLast4 || null,
        color: updated.color || null,
        icon: updated.icon || null,
      });

      const updatedUi = mapBackendWalletToUI(res.wallet);
      showToast(`${updatedUi.name} berhasil diperbarui.`);
      fetchWallets();
      emitRefresh('wallet');
    } catch (err) {
      showToast(mapApiErrorMessage(err));
    }
  };

  const handleDeleteWalletSubmit = async (walletId: string) => {
    try {
      await apiClient.delete(`/api/wallets/${walletId}`);
      showToast('Dompet berhasil dihapus.');
      fetchWallets();
      emitRefresh('wallet');
    } catch (err) {
      showToast(mapApiErrorMessage(err));
    }
  };

  const handleCardClick = (wallet: Wallet) => {
    setSelectedWallet(wallet);
    setIsDetailModalOpen(true);
  };

  const handleEditTrigger = (wallet: Wallet) => {
    setSelectedWallet(wallet);
    setIsEditModalOpen(true);
  };

  const handleDeleteTrigger = (wallet: Wallet) => {
    setSelectedWallet(wallet);
    setIsDeleteDialogOpen(true);
  };

  if (isLoading) {
    return <WalletsSkeleton />;
  }

  return (
    <PageTransition>
      <div className="space-y-8 max-w-7xl mx-auto pb-16">
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-red-50 text-red-600 border border-red-200 text-xs font-semibold">
            {errorMessage}
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#242636] tracking-tight">
              Dompet Saya
            </h1>
            <p className="text-xs sm:text-sm text-[#757A95] mt-0.5">
              Kelola seluruh sumber dana, rekening bank, dan pos tabungan Anda.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsMasked(!isMasked)}
              className="p-2.5 rounded-2xl bg-white/80 hover:bg-white text-[#757A95] hover:text-[#242636] border border-black/[0.05] shadow-2xs transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
              title={isMasked ? 'Tampilkan Saldo' : 'Sembunyikan Saldo'}
            >
              {isMasked ? <EyeOff size={15} /> : <Eye size={15} />}
              <span className="hidden sm:inline">{isMasked ? 'Tampilkan Saldo' : 'Sembunyikan Saldo'}</span>
            </button>

            <Button
              type="button"
              variant="primary"
              size="md"
              icon={<Plus size={16} />}
              onClick={() => setIsAddModalOpen(true)}
            >
              Tambah Dompet
            </Button>
          </div>
        </div>

        <div className="p-6 sm:p-8 rounded-[30px] bg-gradient-to-br from-white/95 via-white/85 to-[#F4F3FF]/80 backdrop-blur-xl border border-white shadow-[0_12px_40px_rgba(48,51,74,0.04)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-[#7C7CE6]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-widest text-[#7C7CE6]">
                  Total Saldo Kas
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E4E2FB] text-[#5F5ED4] border border-[#7C7CE6]/20">
                  {activeWallets.length} Dompet Aktif
                </span>
              </div>

              <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#242636] tracking-tight tabular-nums mt-1.5">
                {isMasked ? 'Rp ••••••••' : formatIDR(totalBalance)}
              </div>
              <p className="text-xs text-[#757A95] mt-1">
                Konsolidasi likuiditas seluruh rekening bank, e-wallet, uang tunai, dan pos tabungan Anda.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
              <div className="p-3.5 rounded-2xl bg-white/90 border border-black/[0.04] shadow-2xs space-y-1">
                <span className="text-[10px] font-bold text-[#757A95] uppercase tracking-wider flex items-center gap-1">
                  <Building2 size={11} className="text-[#7C7CE6]" /> Bank
                </span>
                <div className="text-xs sm:text-sm font-extrabold text-[#242636] tabular-nums">
                  {isMasked ? '••••••••' : formatIDR(bankTotal)}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/90 border border-black/[0.04] shadow-2xs space-y-1">
                <span className="text-[10px] font-bold text-[#757A95] uppercase tracking-wider flex items-center gap-1">
                  <WalletIcon size={11} className="text-[#3B82F6]" /> E-Wallet
                </span>
                <div className="text-xs sm:text-sm font-extrabold text-[#242636] tabular-nums">
                  {isMasked ? '••••••••' : formatIDR(ewalletTotal)}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/90 border border-black/[0.04] shadow-2xs space-y-1">
                <span className="text-[10px] font-bold text-[#757A95] uppercase tracking-wider flex items-center gap-1">
                  <Banknote size={11} className="text-[#10B981]" /> Uang Tunai
                </span>
                <div className="text-xs sm:text-sm font-extrabold text-[#242636] tabular-nums">
                  {isMasked ? '••••••••' : formatIDR(cashTotal)}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/90 border border-black/[0.04] shadow-2xs space-y-1">
                <span className="text-[10px] font-bold text-[#757A95] uppercase tracking-wider flex items-center gap-1">
                  <PiggyBank size={11} className="text-[#5F5ED4]" /> Tabungan
                </span>
                <div className="text-xs sm:text-sm font-extrabold text-[#242636] tabular-nums">
                  {isMasked ? '••••••••' : formatIDR(savingsTotal)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div>
              <h3 className="text-lg font-bold text-[#242636] tracking-tight">
                Koleksi Dompet Saya
              </h3>
              <p className="text-xs text-[#757A95]">
                Klik kartu mana saja untuk melihat rincian mutasi kas dan ringkasan bulanan.
              </p>
            </div>
            <span className="text-xs font-semibold text-[#757A95]">
              {activeWallets.length} Rekening Terhubung
            </span>
          </div>

          {activeWallets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {activeWallets.map((wallet) => (
                <WalletCard
                  key={wallet.id}
                  wallet={wallet}
                  isMasked={isMasked}
                  onClick={handleCardClick}
                  onEdit={handleEditTrigger}
                  onDelete={handleDeleteTrigger}
                />
              ))}

              <AddWalletCard onClick={() => setIsAddModalOpen(true)} />
            </div>
          ) : (
            <div className="p-12 rounded-[30px] bg-white/80 border-2 border-dashed border-black/[0.06] text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#E4E2FB] text-[#7C7CE6] flex items-center justify-center mx-auto shadow-xs">
                <WalletIcon size={28} />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-[#242636]">
                  Belum ada dompet terhubung.
                </h4>
                <p className="text-xs sm:text-sm text-[#757A95] max-w-sm mx-auto">
                  Tambahkan dompet pertama Anda untuk mulai mengelola keuangan.
                </p>
              </div>
              <Button
                type="button"
                variant="primary"
                size="md"
                icon={<Plus size={16} />}
                onClick={() => setIsAddModalOpen(true)}
              >
                Tambah Dompet
              </Button>
            </div>
          )}
        </section>

        <AddWalletModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAddWallet={(newW) => {
            handleAddWalletSubmit({
              name: newW.name,
              type: newW.type,
              institution: newW.holderName,
              accountLast4: newW.accountIdentifier ? newW.accountIdentifier.replace(/\D/g, '').slice(-4) : undefined,
              balance: newW.balance,
              color: (newW as any).colorTheme,
              icon: (newW as any).icon,
            });
          }}
        />

        <WalletPreviewModal
          wallet={selectedWallet}
          isOpen={isPreviewModalOpen}
          onClose={() => setIsPreviewModalOpen(false)}
        />

        <EditWalletModal
          wallet={selectedWallet}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onUpdateWallet={(updated) => {
            handleUpdateWalletSubmit({
              id: updated.id,
              name: updated.name,
              type: updated.type,
              institution: updated.holderName,
              accountLast4: updated.accountIdentifier ? updated.accountIdentifier.replace(/\D/g, '').slice(-4) : undefined,
              color: (updated as any).colorTheme,
              icon: (updated as any).icon,
            });
          }}
        />

        <WalletDetailModal
          wallet={selectedWallet}
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          onEdit={(w) => {
            setIsDetailModalOpen(false);
            setSelectedWallet(w);
            setIsEditModalOpen(true);
          }}
          onArchive={(w) => {
            setIsDetailModalOpen(false);
            setSelectedWallet(w);
            setIsDeleteDialogOpen(true);
          }}
          transactions={transactions}
        />

        <DeleteWalletModal
          wallet={selectedWallet}
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirmDelete={handleDeleteWalletSubmit}
        />

        <WalletSuccessModal
          wallet={lastCreatedWallet}
          isOpen={isSuccessModalOpen}
          onClose={() => setIsSuccessModalOpen(false)}
          onViewWallets={() => setIsSuccessModalOpen(false)}
          onAddAnother={() => {
            setIsSuccessModalOpen(false);
            setIsAddModalOpen(true);
          }}
        />

        <TransactionToast
          message={toastMessage}
          onClose={() => setToastMessage(null)}
        />
      </div>
    </PageTransition>
  );
}
