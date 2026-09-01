'use client';

import React from 'react';
import { Bell, PieChart, Target, CalendarDays } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import SettingRow from './SettingRow';
import SettingToggle from './SettingToggle';

interface NotificationSectionProps {
  budgetReminder: boolean;
  onBudgetReminderChange: (val: boolean) => void;
  goalReminder: boolean;
  onGoalReminderChange: (val: boolean) => void;
  financialSummary: boolean;
  onFinancialSummaryChange: (val: boolean) => void;
}

export default function NotificationSection({
  budgetReminder,
  onBudgetReminderChange,
  goalReminder,
  onGoalReminderChange,
  financialSummary,
  onFinancialSummaryChange,
}: NotificationSectionProps) {
  return (
    <div className="space-y-2.5">
      <span className="text-[11px] font-bold text-[#757A95] uppercase tracking-wider block pl-1">
        Notifikasi & Pengingat
      </span>

      <GlassCard className="divide-y divide-[#E8EAF2]/60">
        {/* 1. Pengingat Budget */}
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

        {/* 2. Pengingat Target */}
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

        {/* 3. Ringkasan Keuangan */}
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
