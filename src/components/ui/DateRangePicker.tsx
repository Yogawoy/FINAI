'use client';

import React from 'react';
import DatePicker from './DatePicker';

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (val: string) => void;
  onEndDateChange: (val: string) => void;
  startLabel?: string;
  endLabel?: string;
  error?: string;
  className?: string;
}

export default function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  startLabel = 'Tanggal Mulai',
  endLabel = 'Tanggal Selesai',
  error,
  className = '',
}: DateRangePickerProps) {
  return (
    <div className={`space-y-1 ${className}`}>
      <div className="grid grid-cols-2 gap-3">
        <DatePicker
          label={startLabel}
          value={startDate}
          onChange={onStartDateChange}
        />

        <DatePicker
          label={endLabel}
          value={endDate}
          onChange={onEndDateChange}
          error={error}
        />
      </div>
    </div>
  );
}
