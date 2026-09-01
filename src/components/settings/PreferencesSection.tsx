'use client';

import React from 'react';
import {
  Globe,
  Coins,
  Hash,
  Wallet,
  Tag,
  Sliders,
  CalendarCheck,
  Percent,
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import CustomSelect, { SelectOption } from '@/components/ui/CustomSelect';
import SettingRow from './SettingRow';
import SettingToggle from './SettingToggle';

interface PreferencesSectionProps {
  language: string;
  onLanguageChange: (val: string) => void;
  currency: string;
  onCurrencyChange: (val: string) => void;
  numberFormat: string;
  onNumberFormatChange: (val: string) => void;
  defaultWallet: string;
  onDefaultWalletChange: (val: string) => void;
  defaultCategory: string;
  onDefaultCategoryChange: (val: string) => void;
  paydayDate: string;
  onPaydayDateChange: (val: string) => void;
  savingsRateTarget: string;
  onSavingsRateTargetChange: (val: string) => void;
  enableAnimations: boolean;
  onAnimationsChange: (val: boolean) => void;
}

const LANGUAGE_OPTIONS: SelectOption[] = [
  { value: 'id', label: 'Bahasa Indonesia', sublabel: 'Bahasa baku aplikasi' },
  { value: 'en', label: 'English (US)', sublabel: 'International English' },
];

const CURRENCY_OPTIONS: SelectOption[] = [
  { value: 'IDR', label: 'Rupiah (IDR)', sublabel: 'Rp - Rupiah Indonesia' },
  { value: 'USD', label: 'Dolar AS (USD)', sublabel: '$ - Dolar Amerika Serikat' },
  { value: 'SGD', label: 'Dolar Singapura (SGD)', sublabel: 'S$ - Dolar Singapura' },
];

const NUMBER_FORMAT_OPTIONS: SelectOption[] = [
  { value: 'id', label: 'Indonesia (10.000,00)', sublabel: 'Titik ribuan, koma desimal' },
  { value: 'en', label: 'Internasional (10,000.00)', sublabel: 'Koma ribuan, titik desimal' },
];

const WALLET_OPTIONS: SelectOption[] = [
  { value: 'w-1', label: 'BCA •••• 4821', sublabel: 'Rekening Utama' },
  { value: 'w-2', label: 'Mandiri •••• 8823', sublabel: 'Rekening Tabungan' },
  { value: 'w-3', label: 'GoPay E-Wallet', sublabel: 'Dompet Digital' },
  { value: 'w-4', label: 'Tunai / Cash', sublabel: 'Uang Fisik' },
];

const CATEGORY_OPTIONS: SelectOption[] = [
  { value: 'Belanja', label: 'Belanja & Kebutuhan', sublabel: 'Pos default transaksi' },
  { value: 'Makanan', label: 'Makanan & Minuman', sublabel: 'Kuliner dan santapan' },
  { value: 'Transportasi', label: 'Transportasi', sublabel: 'Bensin & ongkos' },
  { value: 'Tagihan', label: 'Tagihan & Utilitas', sublabel: 'Listrik, air, WiFi' },
  { value: 'Hiburan', label: 'Hiburan', sublabel: 'Rekreasi & hobi' },
];

const PAYDAY_OPTIONS: SelectOption[] = [
  { value: '25', label: 'Tanggal 25 Bulanan', sublabel: 'Siklus standar payroll' },
  { value: '28', label: 'Tanggal 28 Bulanan', sublabel: 'Akhir bulan kerja' },
  { value: '1', label: 'Tanggal 1 Awal Bulan', sublabel: 'Awal bulan kalender' },
  { value: '5', label: 'Tanggal 5 Bulanan', sublabel: 'Minggu pertama' },
  { value: '10', label: 'Tanggal 10 Bulanan', sublabel: 'Pertengahan awal' },
];

const SAVINGS_TARGET_OPTIONS: SelectOption[] = [
  { value: '20%', label: '20% Pendapatan', sublabel: 'Konservatif & aman' },
  { value: '30%', label: '30% Pendapatan', sublabel: 'Rekomendasi ideal FinAI' },
  { value: '40%', label: '40% Pendapatan', sublabel: 'Optimal percepatan target' },
  { value: '50%', label: '50% Pendapatan', sublabel: 'Agresif / Gerakan FIRE' },
];

export default function PreferencesSection({
  language,
  onLanguageChange,
  currency,
  onCurrencyChange,
  numberFormat,
  onNumberFormatChange,
  defaultWallet,
  onDefaultWalletChange,
  defaultCategory,
  onDefaultCategoryChange,
  paydayDate,
  onPaydayDateChange,
  savingsRateTarget,
  onSavingsRateTargetChange,
  enableAnimations,
  onAnimationsChange,
}: PreferencesSectionProps) {
  return (
    <div className="space-y-2.5">
      <span className="text-[11px] font-bold text-[#757A95] uppercase tracking-wider block pl-1">
        Preferensi & Siklus Keuangan
      </span>

      <GlassCard className="divide-y divide-[#E8EAF2]/60 overflow-visible">
        {/* 1. Siklus Tanggal Gajian */}
        <SettingRow
          icon={<CalendarCheck size={16} className="text-[#1B7354]" />}
          title="Siklus Tanggal Gajian"
          description="Tanggal reset siklus anggaran bulanan dan acuan arus kas masuk Anda"
          action={
            <div className="w-48 sm:w-56">
              <CustomSelect
                value={paydayDate}
                onChange={onPaydayDateChange}
                options={PAYDAY_OPTIONS}
              />
            </div>
          }
        />

        {/* 2. Target Rasio Tabungan */}
        <SettingRow
          icon={<Percent size={16} className="text-[#5F5ED4]" />}
          title="Target Rasio Menabung"
          description="Target persentase pemasukan bulanan yang disisihkan ke target impian"
          action={
            <div className="w-48 sm:w-56">
              <CustomSelect
                value={savingsRateTarget}
                onChange={onSavingsRateTargetChange}
                options={SAVINGS_TARGET_OPTIONS}
              />
            </div>
          }
        />

        {/* 3. Dompet Utama */}
        <SettingRow
          icon={<Wallet size={16} />}
          title="Dompet Kas Utama"
          description="Dompet utama digunakan sebagai pilihan default saat mencatat transaksi"
          action={
            <div className="w-48 sm:w-56">
              <CustomSelect
                value={defaultWallet}
                onChange={onDefaultWalletChange}
                options={WALLET_OPTIONS}
              />
            </div>
          }
        />

        {/* 4. Kategori Default */}
        <SettingRow
          icon={<Tag size={16} />}
          title="Kategori Transaksi Default"
          description="Kategori awal otomatis saat membuka form pencatatan transaksi baru"
          action={
            <div className="w-48 sm:w-56">
              <CustomSelect
                value={defaultCategory}
                onChange={onDefaultCategoryChange}
                options={CATEGORY_OPTIONS}
              />
            </div>
          }
        />

        {/* 5. Mata Uang */}
        <SettingRow
          icon={<Coins size={16} />}
          title="Mata Uang Utama"
          description="Mata uang standar untuk saldo kas, anggaran, dan grafik"
          action={
            <div className="w-48 sm:w-56">
              <CustomSelect
                value={currency}
                onChange={onCurrencyChange}
                options={CURRENCY_OPTIONS}
              />
            </div>
          }
        />

        {/* 6. Format Angka */}
        <SettingRow
          icon={<Hash size={16} />}
          title="Format Angka & Pemisah"
          description="Gaya penulisan angka desimal dan pemisah ribuan"
          action={
            <div className="w-48 sm:w-56">
              <CustomSelect
                value={numberFormat}
                onChange={onNumberFormatChange}
                options={NUMBER_FORMAT_OPTIONS}
              />
            </div>
          }
        />

        {/* 7. Bahasa */}
        <SettingRow
          icon={<Globe size={16} />}
          title="Bahasa Tampilan"
          description="Bahasa utama yang digunakan di seluruh antarmuka FinAI"
          action={
            <div className="w-48 sm:w-56">
              <CustomSelect
                value={language}
                onChange={onLanguageChange}
                options={LANGUAGE_OPTIONS}
              />
            </div>
          }
        />

        {/* 8. Animasi Antarmuka */}
        <SettingRow
          icon={<Sliders size={16} />}
          title="Animasi Antarmuka"
          description="Gunakan animasi halus dan transisi interaktif pada antarmuka"
          action={
            <SettingToggle
              checked={enableAnimations}
              onChange={onAnimationsChange}
              aria-label="Toggle Animasi Antarmuka"
            />
          }
        />
      </GlassCard>
    </div>
  );
}
