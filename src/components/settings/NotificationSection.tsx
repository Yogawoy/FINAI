'use client';

import React from 'react';
import {
  Bell,
  PieChart,
  Target,
  CalendarDays,
  Clock,
  AlertCircle,
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import CustomSelect, { SelectOption } from '@/components/ui/CustomSelect';
import SettingRow from './SettingRow';
import SettingToggle from './SettingToggle';

interface NotificationSectionProps {
  budgetReminder: boolean;
  onBudgetReminderChange: (val: boolean) => void;
  budgetThreshold: string;
  onBudgetThresholdChange: (val: string) => void;
  goalReminder: boolean;
  onGoalReminderChange: (val: boolean) => void;
  financialSummary: boolean;
  onFinancialSummaryChange: (val: boolean) => void;
  dailyReminderTime: string;
  onDailyReminderTimeChange: (val: string) => void;
}

const REMINDER_TIME_OPTIONS: SelectOption[] = [
  { value: '20:00', label: 'Pukul 20:00 WIB', sublabel: 'Malam santai (Rekomendasi)' },
  { value: '19:00', label: 'Pukul 19:00 WIB', sublabel: 'Setelah makan malam' },
  { value: '21:00', label: 'Pukul 21:00 WIB', sublabel: 'Sebelum beristirahat' },
  { value: '12:30', label: 'Pukul 12:30 WIB', sublabel: 'Istirahat siang' },
];

const BUDGET_THRESHOLD_OPTIONS: SelectOption[] = [
  { value: '80%', label: '80% Kuota Terpakai', sublabel: 'Peringatan dini yang seimbang' },
  { value: '70%', label: '70% Kuota Terpakai', sublabel: 'Peringatan sangat dini' },
  { value: '90%', label: '90% Kuota Terpakai', sublabel: 'Peringatan kritis mendekati limit' },
  { value: '100%', label: '100% (Saat Melampaui)', sublabel: 'Hanya ketika limit terlewati' },
];

export default function NotificationSection({
  budgetReminder,
  onBudgetReminderChange,
  budgetThreshold,
  onBudgetThresholdChange,
  goalReminder,
  onGoalReminderChange,
  financialSummary,
  onFinancialSummaryChange,
  dailyReminderTime,
  onDailyReminderTimeChange,
}: NotificationSectionProps) {
  return (
    <div className="space-y-2.5">
      <span className="text-[11px] font-bold text-[#757A95] uppercase tracking-wider block pl-1">
        Notifikasi & Jadwal Pengingat
      </span>

      <GlassCard className="divide-y divide-[#E8EAF2]/60 overflow-visible">
        {/* 1. Pengingat Budget (Master Toggle) */}
        <SettingRow
          icon={<PieChart size={16} />}
          title="Pengingat Batas Anggaran"
          description="Beritahu saya ketika pengeluaran suatu pos mendekati atau melebihi batas budget"
          action={
            <SettingToggle
              checked={budgetReminder}
              onChange={onBudgetReminderChange}
              aria-label="Toggle Pengingat Anggaran"
            />
          }
        />

        {/* 2. Ambang Batas Budget (Dropdown) - Active when toggle is ON */}
        {budgetReminder && (
          <SettingRow
            icon={<AlertCircle size={16} className="text-[#D94F4F]" />}
            title="Ambang Batas Peringatan Budget"
            description="Batas persentase pengeluaran untuk memicu alarm peringatan dini kuota anggaran"
            action={
              <div className="w-48 sm:w-56">
                <CustomSelect
                  value={budgetThreshold}
                  onChange={onBudgetThresholdChange}
                  options={BUDGET_THRESHOLD_OPTIONS}
                />
              </div>
            }
          />
        )}

        {/* 3. Waktu Pengingat Harian (Dropdown) */}
        <SettingRow
          icon={<Clock size={16} className="text-[#7C7CE6]" />}
          title="Jadwal Pengingat Catat Harian"
          description="Waktu notifikasi setiap malam agar tidak ada pengeluaran harian yang lupa dicatat"
          action={
            <div className="w-48 sm:w-56">
              <CustomSelect
                value={dailyReminderTime}
                onChange={onDailyReminderTimeChange}
                options={REMINDER_TIME_OPTIONS}
              />
            </div>
          }
        />

        {/* 4. Pengingat Target */}
        <SettingRow
          icon={<Target size={16} />}
          title="Pengingat Progres Target"
          description="Beritahu saya jika setoran bulanan atau progres target impian tertinggal"
          action={
            <SettingToggle
              checked={goalReminder}
              onChange={onGoalReminderChange}
              aria-label="Toggle Pengingat Target"
            />
          }
        />

        {/* 5. Ringkasan Keuangan */}
        <SettingRow
          icon={<CalendarDays size={16} />}
          title="Ringkasan Kondisi Keuangan"
          description="Dapatkan ringkasan evaluasi arus kas dan rasio tabungan secara berkala"
          action={
            <SettingToggle
              checked={financialSummary}
              onChange={onFinancialSummaryChange}
              aria-label="Toggle Ringkasan Keuangan"
            />
          }
        />
      </GlassCard>
    </div>
  );
}
