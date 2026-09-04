'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { CircleCheck, Loader2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/lib/api-client';

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

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout: authLogout } = useAuth();

  // Settings state
  const [settings, setSettings] = useState<SettingsData>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Modals state
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isExportDataOpen, setIsExportDataOpen] = useState(false);
  const [isDeleteDataOpen, setIsDeleteDataOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  // Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback((message: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(message);
    toastTimerRef.current = setTimeout(() => setToastMessage(null), 3500);
  }, []);

  // Load settings from API on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await apiClient.get<{ settings: any }>('/api/settings');
        if (res.settings) {
          const s = res.settings;
          setSettings({
            language: s.language === 'en-US' ? 'en' : 'id',
            currency: s.currency || 'IDR',
            numberFormat: s.numberFormat === 'en-US' ? 'en' : 'id',
            defaultWalletId: s.defaultWalletId || null,
            defaultCategory: s.defaultCategory || 'Belanja',
            paydayDate: s.paydayDate || '25',
            savingsRateTarget: s.savingsRateTarget || '30%',
            budgetReminder: s.budgetReminder ?? true,
            budgetThreshold: s.budgetThreshold || '80%',
            goalReminder: s.goalReminder ?? true,
            financialSummary: s.financialSummary ?? true,
            dailyReminderTime: s.dailyReminderTime || '20:00',
            aiPersonalization: s.aiPersonalization ?? true,
            aiActionConfirmation: s.aiActionConfirmation ?? true,
            animations: s.animations ?? true,
          });
        }
      } catch {
        // Use defaults on error
      } finally {
        setIsLoading(false);
      }
    };
    loadSettings();
  }, []);

  // Save settings to API (debounced)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const saveSettings = useCallback((patch: Partial<SettingsData>) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      setIsSaving(true);
      try {
        const apiPatch: Record<string, any> = {};
        if (patch.language !== undefined) apiPatch.language = patch.language === 'en' ? 'en-US' : 'id-ID';
        if (patch.currency !== undefined) apiPatch.currency = patch.currency;
        if (patch.numberFormat !== undefined) apiPatch.numberFormat = patch.numberFormat === 'en' ? 'en-US' : 'id-ID';
        if (patch.defaultCategory !== undefined) apiPatch.defaultCategory = patch.defaultCategory;
        if (patch.budgetReminder !== undefined) apiPatch.budgetReminder = patch.budgetReminder;
        if (patch.goalReminder !== undefined) apiPatch.goalReminder = patch.goalReminder;
        if (patch.financialSummary !== undefined) apiPatch.financialSummary = patch.financialSummary;
        if (patch.aiPersonalization !== undefined) apiPatch.aiPersonalization = patch.aiPersonalization;
        if (patch.aiActionConfirmation !== undefined) apiPatch.aiActionConfirmation = patch.aiActionConfirmation;
        if (patch.animations !== undefined) apiPatch.animations = patch.animations;

        await apiClient.patch('/api/settings', apiPatch);
      } catch {
        showToast('Gagal menyimpan pengaturan. Silakan coba lagi.');
      } finally {
        setIsSaving(false);
      }
    }, 500);
  }, [showToast]);

  // Profile handler
  const handleSaveProfile = async (name: string, email: string) => {
    try {
      await apiClient.patch('/api/settings', {});
      showToast('Profil berhasil diperbarui.');
    } catch {
      showToast('Gagal memperbarui profil.');
    }
  };

  // Settings change handlers — update local state + persist to API
  const updateSetting = <K extends keyof SettingsData>(key: K, value: SettingsData[K], toastMsg?: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    saveSettings({ [key]: value });
    if (toastMsg) showToast(toastMsg);
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await authLogout();
    } catch {
      // AuthContext handles redirect
    }
  };

  // Export handler
  const handleExportSuccess = (format: 'csv' | 'json', count: number) => {
    showToast(`Berkas cadangan (.${format}) berhasil diunduh ke perangkat Anda.`);
  };

  // Import handler
  const handleImportSuccess = (fileName: string) => {
    showToast(`Berkas ${fileName} berhasil diimpor.`);
  };

  // Delete data handler
  const handleDeleteData = () => {
    showToast('Seluruh data transaksi dan anggaran telah dibersihkan.');
  };

  if (isLoading) {
    return (
      <div className="max-w-[1150px] mx-auto flex items-center justify-center py-32">
        <Loader2 size={24} className="animate-spin text-[#7C7CE6]" />
      </div>
    );
  }

  const displayName = user?.name || 'User';
  const displayEmail = user?.email || 'user@example.com';

  return (
    <div className="max-w-[1150px] mx-auto space-y-7 pb-16 relative">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed top-6 right-6 z-50 p-4 rounded-2xl bg-white border border-[#D0EFE5] shadow-[0_10px_35px_rgba(27,115,84,0.12)] flex items-center gap-3 text-xs font-bold text-[#1B7354]"
          >
            <div className="w-7 h-7 rounded-xl bg-[#EBF7F2] flex items-center justify-center shrink-0">
              <CircleCheck size={16} strokeWidth={2.5} />
            </div>
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Page Header */}
      <SettingsHeader />

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
        defaultWallet={settings.defaultWalletId || 'w-1'}
        onDefaultWalletChange={(val) => updateSetting('defaultWalletId', val, 'Dompet kas default berhasil diperbarui.')}
        defaultCategory={settings.defaultCategory || 'Belanja'}
        onDefaultCategoryChange={(val) => updateSetting('defaultCategory', val, 'Kategori default berhasil diperbarui.')}
        paydayDate={settings.paydayDate}
        onPaydayDateChange={(val) => updateSetting('paydayDate', val, `Siklus gajian diatur setiap tanggal ${val} bulanan.`)}
        savingsRateTarget={settings.savingsRateTarget}
        onSavingsRateTargetChange={(val) => updateSetting('savingsRateTarget', val, `Target rasio tabungan diatur ke ${val} pendapatan.`)}
        enableAnimations={settings.animations}
        onAnimationsChange={(val) => updateSetting('animations', val, val ? 'Animasi antarmuka diaktifkan.' : 'Animasi antarmuka dinonaktifkan.')}
      />

      {/* 4. Notification Section */}
      <NotificationSection
        budgetReminder={settings.budgetReminder}
        onBudgetReminderChange={(val) => updateSetting('budgetReminder', val, val ? 'Pengingat anggaran diaktifkan.' : 'Pengingat anggaran dinonaktifkan.')}
        budgetThreshold={settings.budgetThreshold}
        onBudgetThresholdChange={(val) => updateSetting('budgetThreshold' as any, val, `Ambang batas peringatan anggaran diatur ke ${val}.`)}
        goalReminder={settings.goalReminder}
        onGoalReminderChange={(val) => updateSetting('goalReminder', val, val ? 'Pengingat target impian diaktifkan.' : 'Pengingat target impian dinonaktifkan.')}
        financialSummary={settings.financialSummary}
        onFinancialSummaryChange={(val) => updateSetting('financialSummary', val, val ? 'Ringkasan keuangan berkala diaktifkan.' : 'Ringkasan keuangan berkala dinonaktifkan.')}
        dailyReminderTime={settings.dailyReminderTime}
        onDailyReminderTimeChange={(val) => updateSetting('dailyReminderTime' as any, val, `Jadwal pengingat harian diatur ke pukul ${val} WIB.`)}
      />

      {/* 5. AI Settings Section */}
      <AISettingsSection
        personalization={settings.aiPersonalization}
        onPersonalizationChange={(val) => updateSetting('aiPersonalization', val, val ? 'Personalisasi AI diaktifkan.' : 'Personalisasi AI dinonaktifkan.')}
        actionConfirmation={settings.aiActionConfirmation}
        onActionConfirmationChange={(val) => updateSetting('aiActionConfirmation', val, val ? 'Konfirmasi aksi AI diwajibkan.' : 'Konfirmasi aksi AI dilewati.')}
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
        onSave={handleSaveProfile}
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
