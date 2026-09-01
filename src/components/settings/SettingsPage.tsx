'use client';

import React, { useState } from 'react';
import { CircleCheck } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

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

export default function SettingsPage() {
  // 1. Profile State
  const [profile, setProfile] = useState({
    name: 'Yoga W.',
    email: 'user@example.com',
    membershipTier: 'FinAI Pro',
  });

  // 2. Preferences State
  const [language, setLanguage] = useState('id');
  const [currency, setCurrency] = useState('IDR');
  const [numberFormat, setNumberFormat] = useState('id');
  const [defaultWallet, setDefaultWallet] = useState('w-1');
  const [defaultCategory, setDefaultCategory] = useState('Belanja');
  const [paydayDate, setPaydayDate] = useState('25');
  const [savingsRateTarget, setSavingsRateTarget] = useState('30%');
  const [enableAnimations, setEnableAnimations] = useState(true);

  // 3. Notification State
  const [budgetReminder, setBudgetReminder] = useState(true);
  const [budgetThreshold, setBudgetThreshold] = useState('80%');
  const [goalReminder, setGoalReminder] = useState(true);
  const [financialSummary, setFinancialSummary] = useState(true);
  const [dailyReminderTime, setDailyReminderTime] = useState('20:00');

  // 4. AI Settings State
  const [aiPersonalization, setAiPersonalization] = useState(true);
  const [aiActionConfirmation, setAiActionConfirmation] = useState(true);

  // 5. Security State
  const [pinLockEnabled, setPinLockEnabled] = useState(false);

  // 6. Modals State
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isExportDataOpen, setIsExportDataOpen] = useState(false);
  const [isDeleteDataOpen, setIsDeleteDataOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  // 7. Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Handlers
  const handleSaveProfile = (name: string, email: string) => {
    setProfile((prev) => ({ ...prev, name, email }));
    showToast('Pengaturan profil berhasil diperbarui.');
  };

  const handleExportSuccess = (format: 'csv' | 'json', count: number) => {
    showToast(`Berkas cadangan (.${format}) berhasil diunduh ke perangkat Anda.`);
  };

  const handleImportSuccess = (fileName: string) => {
    showToast(`Berkas ${fileName} berhasil diimpor & dipulihkan.`);
  };

  const handleDeleteData = () => {
    showToast('Seluruh data transaksi dan anggaran telah dibersihkan.');
  };

  const handleLogout = () => {
    showToast('Sesi akun FinAI berhasil diakhiri.');
  };

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
        name={profile.name}
        email={profile.email}
        membershipStatus={profile.membershipTier}
        onEditProfile={() => setIsEditProfileOpen(true)}
      />

      {/* 3. Preferences Section */}
      <PreferencesSection
        language={language}
        onLanguageChange={(val) => {
          setLanguage(val);
          showToast('Preferensi bahasa berhasil diperbarui.');
        }}
        currency={currency}
        onCurrencyChange={(val) => {
          setCurrency(val);
          showToast('Mata uang utama berhasil diperbarui.');
        }}
        numberFormat={numberFormat}
        onNumberFormatChange={(val) => {
          setNumberFormat(val);
          showToast('Format angka berhasil diperbarui.');
        }}
        defaultWallet={defaultWallet}
        onDefaultWalletChange={(val) => {
          setDefaultWallet(val);
          showToast('Dompet kas default berhasil diperbarui.');
        }}
        defaultCategory={defaultCategory}
        onDefaultCategoryChange={(val) => {
          setDefaultCategory(val);
          showToast('Kategori default berhasil diperbarui.');
        }}
        paydayDate={paydayDate}
        onPaydayDateChange={(val) => {
          setPaydayDate(val);
          showToast(`Siklus gajian diatur setiap tanggal ${val} bulanan.`);
        }}
        savingsRateTarget={savingsRateTarget}
        onSavingsRateTargetChange={(val) => {
          setSavingsRateTarget(val);
          showToast(`Target rasio tabungan diatur ke ${val} pendapatan.`);
        }}
        enableAnimations={enableAnimations}
        onAnimationsChange={(val) => {
          setEnableAnimations(val);
          showToast(val ? 'Animasi antarmuka diaktifkan.' : 'Animasi antarmuka dinonaktifkan.');
        }}
      />

      {/* 4. Notification Section */}
      <NotificationSection
        budgetReminder={budgetReminder}
        onBudgetReminderChange={(val) => {
          setBudgetReminder(val);
          showToast(val ? 'Pengingat anggaran diaktifkan.' : 'Pengingat anggaran dinonaktifkan.');
        }}
        budgetThreshold={budgetThreshold}
        onBudgetThresholdChange={(val) => {
          setBudgetThreshold(val);
          showToast(`Ambang batas peringatan anggaran diatur ke ${val}.`);
        }}
        goalReminder={goalReminder}
        onGoalReminderChange={(val) => {
          setGoalReminder(val);
          showToast(val ? 'Pengingat target impian diaktifkan.' : 'Pengingat target impian dinonaktifkan.');
        }}
        financialSummary={financialSummary}
        onFinancialSummaryChange={(val) => {
          setFinancialSummary(val);
          showToast(val ? 'Ringkasan keuangan berkala diaktifkan.' : 'Ringkasan keuangan berkala dinonaktifkan.');
        }}
        dailyReminderTime={dailyReminderTime}
        onDailyReminderTimeChange={(val) => {
          setDailyReminderTime(val);
          showToast(`Jadwal pengingat harian diatur ke pukul ${val} WIB.`);
        }}
      />

      {/* 5. AI Settings Section */}
      <AISettingsSection
        personalization={aiPersonalization}
        onPersonalizationChange={(val) => {
          setAiPersonalization(val);
          showToast(val ? 'Personalisasi AI diaktifkan.' : 'Personalisasi AI dinonaktifkan.');
        }}
        actionConfirmation={aiActionConfirmation}
        onActionConfirmationChange={(val) => {
          setAiActionConfirmation(val);
          showToast(val ? 'Konfirmasi aksi AI diwajibkan.' : 'Konfirmasi aksi AI dilewati.');
        }}
      />

      {/* 6. Security Section */}
      <SecuritySection
        pinLockEnabled={pinLockEnabled}
        onPinLockChange={(val) => {
          setPinLockEnabled(val);
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
        membershipTier={profile.membershipTier}
        onOpenLogoutModal={() => setIsLogoutOpen(true)}
      />

      {/* Modals */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        initialName={profile.name}
        initialEmail={profile.email}
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
