'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { CircleCheck, CircleAlert } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/lib/api-client';
import { emitRefresh } from '@/lib/data-refresh';
import { formatIDR } from '@/lib/format';
import { SerializedSettings } from '@/types';
import { SelectOption } from '@/components/ui/CustomSelect';

import SettingsHeader from './SettingsHeader';
import ProfileSection from './ProfileSection';
import EditProfileModal from './EditProfileModal';
import PreferencesSection from './PreferencesSection';
import NotificationSection from './NotificationSection';
import AISettingsSection from './AISettingsSection';
import SecuritySection from './SecuritySection';
import DataPrivacySection from './DataPrivacySection';
import AccountSection from './AccountSection';
import ExportDataModal from './ExportDataModal';
import DeleteDataModal from './DeleteDataModal';
import LogoutModal from './LogoutModal';
import SettingsSkeleton from './SettingsSkeleton';

interface SettingsData {
  language: string;
  currency: string;
  numberFormat: string;
  defaultWalletId: string | null;
  defaultCategory: string | null;
  paydayDate: string;
  savingsRateTarget: string;
  budgetReminder: boolean;
  budgetThreshold: string;
  goalReminder: boolean;
  financialSummary: boolean;
  dailyReminderTime: string;
  aiPersonalization: boolean;
  aiActionConfirmation: boolean;
  animations: boolean;
}

const DEFAULT_SETTINGS: SettingsData = {
  language: 'id',
  currency: 'IDR',
  numberFormat: 'id',
  defaultWalletId: null,
  defaultCategory: 'Belanja',
  paydayDate: '25',
  savingsRateTarget: '30%',
  budgetReminder: true,
  budgetThreshold: '80%',
  goalReminder: true,
  financialSummary: true,
  dailyReminderTime: '20:00',
  aiPersonalization: true,
  aiActionConfirmation: true,
  animations: true,
};

interface WalletApiItem {
  id: string;
  name: string;
  type: string;
  institution?: string | null;
  balance: string | number;
}

export default function SettingsPage() {
  const { user, logout: authLogout, refreshUser } = useAuth();

  // Settings & Wallet state
  const [settings, setSettings] = useState<SettingsData>(DEFAULT_SETTINGS);
  const [walletOptions, setWalletOptions] = useState<SelectOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Modals state
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isExportDataOpen, setIsExportDataOpen] = useState(false);
  const [isDeleteDataOpen, setIsDeleteDataOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{ message: string; isError?: boolean } | null>(null);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback((message: string, isError = false) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, isError });
    toastTimerRef.current = setTimeout(() => setToast(null), 3500);
  }, []);

  // Load settings & wallets from API on mount
  useEffect(() => {
    let isMounted = true;

    const loadInitialData = async () => {
      try {
        const [settingsRes, walletsRes] = await Promise.all([
          apiClient.get<{ settings: SerializedSettings }>('/api/settings'),
          apiClient.get<{ wallets: WalletApiItem[] }>('/api/wallets').catch(() => ({ wallets: [] })),
        ]);

        if (!isMounted) return;

        // Process dynamic user wallets
        const rawWallets = walletsRes.wallets || [];
        const options: SelectOption[] = [
          { value: '', label: 'Belum Ditentukan', sublabel: 'Pilih dompet manual saat transaksi' },
          ...rawWallets.map((w) => ({
            value: w.id,
            label: w.name,
            sublabel: `${w.institution || w.type} • Saldo: ${formatIDR(Number(w.balance))}`,
          })),
        ];
        setWalletOptions(options);

        // Process user settings from PostgreSQL
        if (settingsRes.settings) {
          const s = settingsRes.settings;
          setSettings((prev) => ({
            ...prev,
            language: s.language === 'en-US' ? 'en' : 'id',
            currency: s.currency || 'IDR',
            numberFormat: s.numberFormat === 'en-US' ? 'en' : 'id',
            defaultWalletId: s.defaultWalletId || null,
            defaultCategory: s.defaultCategory || 'Belanja',
            budgetReminder: s.budgetReminder ?? true,
            goalReminder: s.goalReminder ?? true,
            financialSummary: s.financialSummary ?? true,
            aiPersonalization: s.aiPersonalization ?? true,
            aiActionConfirmation: s.aiActionConfirmation ?? true,
            animations: s.animations ?? true,
          }));
        }
      } catch (err) {
        console.error('Failed to load settings data:', err);
        showToast('Gagal memuat pengaturan dari server.', true);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, [showToast]);

  // Save settings to API (debounced)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const saveSettings = useCallback(
    (patch: Partial<SettingsData>) => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

      saveTimeoutRef.current = setTimeout(async () => {
        setIsSaving(true);
        try {
          const apiPatch: Record<string, string | boolean | null> = {};

          if (patch.language !== undefined) {
            apiPatch.language = patch.language === 'en' ? 'en-US' : 'id-ID';
          }
          if (patch.currency !== undefined) {
            apiPatch.currency = patch.currency;
          }
          if (patch.numberFormat !== undefined) {
            apiPatch.numberFormat = patch.numberFormat === 'en' ? 'en-US' : 'id-ID';
          }
          if (patch.defaultWalletId !== undefined) {
            apiPatch.defaultWalletId = patch.defaultWalletId || null;
          }
          if (patch.defaultCategory !== undefined) {
            apiPatch.defaultCategory = patch.defaultCategory;
          }
          if (patch.budgetReminder !== undefined) {
            apiPatch.budgetReminder = patch.budgetReminder;
          }
          if (patch.goalReminder !== undefined) {
            apiPatch.goalReminder = patch.goalReminder;
          }
          if (patch.financialSummary !== undefined) {
            apiPatch.financialSummary = patch.financialSummary;
          }
          if (patch.aiPersonalization !== undefined) {
            apiPatch.aiPersonalization = patch.aiPersonalization;
          }
          if (patch.aiActionConfirmation !== undefined) {
            apiPatch.aiActionConfirmation = patch.aiActionConfirmation;
          }
          if (patch.animations !== undefined) {
            apiPatch.animations = patch.animations;
          }

          // Send to API if there are persistent database fields
          if (Object.keys(apiPatch).length > 0) {
            await apiClient.patch('/api/settings', apiPatch);
            emitRefresh('settings');
          }
        } catch (error) {
          console.error('Save settings error:', error);
          showToast('Gagal menyimpan pengaturan ke database.', true);
        } finally {
          setIsSaving(false);
        }
      }, 400);
    },
    [showToast]
  );

  // Profile handler (updates user name via PATCH /api/auth/me)
  const handleSaveProfile = async (name: string) => {
    try {
      await apiClient.patch('/api/auth/me', { name });
      await refreshUser();
      emitRefresh('profile');
      showToast('Profil pengguna berhasil diperbarui.');
    } catch (error) {
      console.error('Update profile error:', error);
      showToast('Gagal memperbarui profil. Periksa data Anda.', true);
    }
  };

  // Settings change handlers — update local state + persist to API
  const updateSetting = <K extends keyof SettingsData>(
    key: K,
    value: SettingsData[K],
    toastMsg?: string
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    saveSettings({ [key]: value });
    if (toastMsg) showToast(toastMsg);
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await authLogout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Export handler
  const handleExportSuccess = (format: 'csv' | 'json', count: number) => {
    showToast(`Berkas cadangan (.${format}) berhasil diunduh (${count} dataset).`);
  };

  // Import handler
  const handleImportSuccess = (fileName: string) => {
    showToast(`Berkas ${fileName} berhasil diimpor.`);
  };

  // Delete data handler
  const handleDeleteData = () => {
    showToast('Permintaan pembersihan data telah diproses.');
  };

  if (isLoading) {
    return <SettingsSkeleton />;
  }

  const displayName = user?.name || 'User';
  const displayEmail = user?.email || 'user@example.com';

  return (
    <div className="max-w-[1150px] mx-auto space-y-7 pb-16 relative">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`fixed top-6 right-6 z-50 p-4 rounded-2xl bg-white border shadow-[0_10px_35px_rgba(27,115,84,0.12)] flex items-center gap-3 text-xs font-bold ${
              toast.isError
                ? 'border-[#FCE2E0] text-[#D94F4F]'
                : 'border-[#D0EFE5] text-[#1B7354]'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                toast.isError ? 'bg-[#FEF3F2]' : 'bg-[#EBF7F2]'
              }`}
            >
              {toast.isError ? (
                <CircleAlert size={16} strokeWidth={2.5} />
              ) : (
                <CircleCheck size={16} strokeWidth={2.5} />
              )}
            </div>
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Page Header with Saving Indicator */}
      <div className="relative">
        <SettingsHeader />
        {isSaving && (
          <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-2 text-xs font-semibold text-[#7C7CE6] bg-[#EDEAFC] px-3 py-1.5 rounded-xl animate-pulse">
            <span className="w-2 h-2 rounded-full bg-[#7C7CE6]" />
            <span>Menyimpan...</span>
          </div>
        )}
      </div>

      {/* 2. Profile Section */}
      <ProfileSection
        name={displayName}
        email={displayEmail}
        membershipStatus="FinAI Pro"
        onEditProfile={() => setIsEditProfileOpen(true)}
      />

      {/* 3. Preferences Section */}
      <PreferencesSection
        language={settings.language}
        onLanguageChange={(val) => updateSetting('language', val, 'Preferensi bahasa berhasil diperbarui.')}
        currency={settings.currency}
        onCurrencyChange={(val) => updateSetting('currency', val, 'Mata uang utama berhasil diperbarui.')}
        numberFormat={settings.numberFormat}
        onNumberFormatChange={(val) => updateSetting('numberFormat', val, 'Format angka berhasil diperbarui.')}
        defaultWallet={settings.defaultWalletId || ''}
        onDefaultWalletChange={(val) =>
          updateSetting('defaultWalletId', val || null, 'Dompet kas default berhasil diperbarui.')
        }
        walletOptions={walletOptions}
        defaultCategory={settings.defaultCategory || 'Belanja'}
        onDefaultCategoryChange={(val) => updateSetting('defaultCategory', val, 'Kategori default berhasil diperbarui.')}
        paydayDate={settings.paydayDate}
        onPaydayDateChange={(val) => updateSetting('paydayDate', val, `Siklus gajian diatur setiap tanggal ${val} bulanan.`)}
        savingsRateTarget={settings.savingsRateTarget}
        onSavingsRateTargetChange={(val) =>
          updateSetting('savingsRateTarget', val, `Target rasio tabungan diatur ke ${val} pendapatan.`)
        }
      />

      {/* 4. Notification Section */}
      <NotificationSection
        budgetReminder={settings.budgetReminder}
        onBudgetReminderChange={(val) =>
          updateSetting('budgetReminder', val, val ? 'Pengingat anggaran diaktifkan.' : 'Pengingat anggaran dinonaktifkan.')
        }
        budgetThreshold={settings.budgetThreshold}
        onBudgetThresholdChange={(val) =>
          updateSetting('budgetThreshold', val, `Ambang batas peringatan anggaran diatur ke ${val}.`)
        }
        goalReminder={settings.goalReminder}
        onGoalReminderChange={(val) =>
          updateSetting('goalReminder', val, val ? 'Pengingat target impian diaktifkan.' : 'Pengingat target impian dinonaktifkan.')
        }
        financialSummary={settings.financialSummary}
        onFinancialSummaryChange={(val) =>
          updateSetting('financialSummary', val, val ? 'Ringkasan keuangan berkala diaktifkan.' : 'Ringkasan keuangan berkala dinonaktifkan.')
        }
        dailyReminderTime={settings.dailyReminderTime}
        onDailyReminderTimeChange={(val) =>
          updateSetting('dailyReminderTime', val, `Jadwal pengingat harian diatur ke pukul ${val} WIB.`)
        }
      />

      {/* 5. AI Settings Section */}
      <AISettingsSection
        personalization={settings.aiPersonalization}
        onPersonalizationChange={(val) =>
          updateSetting('aiPersonalization', val, val ? 'Personalisasi AI diaktifkan.' : 'Personalisasi AI dinonaktifkan.')
        }
        actionConfirmation={settings.aiActionConfirmation}
        onActionConfirmationChange={(val) =>
          updateSetting('aiActionConfirmation', val, val ? 'Konfirmasi aksi AI diwajibkan.' : 'Konfirmasi aksi AI dilewati.')
        }
      />

      {/* 6. Security Section */}
      <SecuritySection
        pinLockEnabled={false}
        onPinLockChange={(val) => {
          showToast(val ? 'Kunci PIN transaksi diaktifkan.' : 'Kunci PIN transaksi dinonaktifkan.');
        }}
        onTriggerToast={showToast}
      />

      {/* 7. Data & Privacy Section */}
      <DataPrivacySection
        onOpenExportModal={() => setIsExportDataOpen(true)}
        onOpenDeleteModal={() => setIsDeleteDataOpen(true)}
        onImportSuccess={handleImportSuccess}
      />

      {/* 8. Account Section */}
      <AccountSection
        membershipTier="FinAI Pro"
        onOpenLogoutModal={() => setIsLogoutOpen(true)}
      />

      {/* Modals */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        initialName={displayName}
        initialEmail={displayEmail}
        onSave={(name) => handleSaveProfile(name)}
      />

      <ExportDataModal
        isOpen={isExportDataOpen}
        onClose={() => setIsExportDataOpen(false)}
        onExportSuccess={handleExportSuccess}
      />

      <DeleteDataModal
        isOpen={isDeleteDataOpen}
        onClose={() => setIsDeleteDataOpen(false)}
        onConfirmDelete={handleDeleteData}
      />

      <LogoutModal
        isOpen={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
        onConfirmLogout={handleLogout}
      />
    </div>
  );
}
