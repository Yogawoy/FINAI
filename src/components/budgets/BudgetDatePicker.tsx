'use client';

import React from 'react';
import DateRangePicker from '@/components/ui/DateRangePicker';

interface BudgetDatePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (val: string) => void;
  onEndDateChange: (val: string) => void;
  error?: string;
}

export default function BudgetDatePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  error,
}: BudgetDatePickerProps) {
  return (
    <DateRangePicker
      startDate={startDate}
      endDate={endDate}
      onStartDateChange={onStartDateChange}
      onEndDateChange={onEndDateChange}
      startLabel="Tanggal Mulai"
      endLabel="Tanggal Selesai"
      error={error}
    />
  );
}
