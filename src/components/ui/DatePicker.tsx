'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface DatePickerProps {
  value: string; // ISO date YYYY-MM-DD
  onChange: (val: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  error?: string;
}

const MONTH_NAMES_ID = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

const DAY_NAMES_ID = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

export default function DatePicker({
  value,
  onChange,
  label,
  placeholder = 'Pilih tanggal...',
  className = '',
  error,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse initial date
  const parsedDate = useMemo(() => {
    if (!value) return new Date();
    const parts = value.split('-').map(Number);
    if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
      return new Date(parts[0], parts[1] - 1, parts[2]);
    }
    return new Date();
  }, [value]);

  // Current calendar view month & year
  const [viewYear, setViewYear] = useState(parsedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsedDate.getMonth());

  useEffect(() => {
    if (isOpen) {
      setViewYear(parsedDate.getFullYear());
      setViewMonth(parsedDate.getMonth());
    }
  }, [isOpen, parsedDate]);

  // Click outside & Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Navigate months
  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  // Build calendar matrix (Monday as first day of week)
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
    const lastDayOfMonth = new Date(viewYear, viewMonth + 1, 0);

    const totalDays = lastDayOfMonth.getDate();
    // Monday is 1, Sunday is 0 in JS Date -> convert Sunday to 7
    let startDayOfWeek = firstDayOfMonth.getDay();
    if (startDayOfWeek === 0) startDayOfWeek = 7;
    const paddingLeft = startDayOfWeek - 1;

    const days: { dayNumber: number; dateStr: string; isCurrentMonth: boolean }[] = [];

    // Previous month padding
    const prevMonthLastDay = new Date(viewYear, viewMonth, 0).getDate();
    for (let i = paddingLeft - 1; i >= 0; i--) {
      const d = prevMonthLastDay - i;
      const m = viewMonth === 0 ? 12 : viewMonth;
      const y = viewMonth === 0 ? viewYear - 1 : viewYear;
      const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ dayNumber: d, dateStr, isCurrentMonth: false });
    }

    // Current month days
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ dayNumber: d, dateStr, isCurrentMonth: true });
    }

    // Next month padding to fill grid (multiple of 7)
    const remainingSlots = 7 - (days.length % 7);
    if (remainingSlots < 7) {
      for (let d = 1; d <= remainingSlots; d++) {
        const m = viewMonth === 11 ? 1 : viewMonth + 2;
        const y = viewMonth === 11 ? viewYear + 1 : viewYear;
        const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        days.push({ dayNumber: d, dateStr, isCurrentMonth: false });
      }
    }

    return days;
  }, [viewYear, viewMonth]);

  const handleSelectDate = (dateStr: string) => {
    onChange(dateStr);
    setIsOpen(false);
  };

  const handleSelectToday = () => {
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    onChange(dateStr);
    setIsOpen(false);
  };

  // Formatted display in trigger button (e.g. 31 Agustus 2026)
  const displayFormattedDate = useMemo(() => {
    if (!value) return placeholder;
    const parts = value.split('-').map(Number);
    if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
      const day = parts[2];
      const monthName = MONTH_NAMES_ID[parts[1] - 1] || '';
      const year = parts[0];
      return `${day} ${monthName} ${year}`;
    }
    return value;
  }, [value, placeholder]);

  const todayStr = useMemo(() => {
    const t = new Date();
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
  }, []);

  return (
    <div ref={containerRef} className={`relative space-y-1 ${className}`}>
      {label && (
        <label className="text-[11px] font-bold text-[#757A95] uppercase tracking-wider block">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className={`w-full px-3 py-2.5 bg-[#F8F9FD] hover:bg-white border transition-all rounded-xl text-xs sm:text-sm flex items-center justify-between text-left cursor-pointer select-none ${
          isOpen
            ? 'border-[#7C7CE6] bg-white ring-2 ring-[#7C7CE6]/20 shadow-xs'
            : 'border-black/[0.06] hover:border-black/[0.12]'
        } ${error ? 'border-[#FAC2BE] bg-[#FFF1F0]' : ''}`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <CalendarIcon size={15} className="text-[#7C7CE6] shrink-0" />
          <span className="truncate font-semibold text-[#242636]">
            {displayFormattedDate}
          </span>
        </div>
      </button>

      {error && (
        <p className="text-[10px] font-semibold text-[#B83A38] pl-0.5">{error}</p>
      )}

      {/* Custom Calendar Popover Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute left-0 top-full mt-1.5 p-3.5 bg-white border border-black/[0.08] rounded-2xl shadow-[0_14px_35px_rgba(36,38,54,0.14)] z-50 w-[280px] sm:w-[290px] space-y-3"
          >
            {/* Calendar Month Header */}
            <div className="flex items-center justify-between px-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-[#757A95] hover:text-[#242636] hover:bg-black/[0.04] transition-colors cursor-pointer"
                title="Bulan Sebelumnya"
              >
                <ChevronLeft size={16} />
              </button>

              <span className="text-xs font-bold text-[#242636]">
                {MONTH_NAMES_ID[viewMonth]} {viewYear}
              </span>

              <button
                type="button"
                onClick={handleNextMonth}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-[#757A95] hover:text-[#242636] hover:bg-black/[0.04] transition-colors cursor-pointer"
                title="Bulan Berikutnya"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {DAY_NAMES_ID.map((dayName) => (
                <span key={dayName} className="text-[10px] font-bold text-[#757A95]">
                  {dayName}
                </span>
              ))}
            </div>

            {/* Calendar Days Matrix */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map(({ dayNumber, dateStr, isCurrentMonth }, idx) => {
                const isSelected = dateStr === value;
                const isToday = dateStr === todayStr;

                return (
                  <button
                    key={`${dateStr}-${idx}`}
                    type="button"
                    onClick={() => handleSelectDate(dateStr)}
                    className={`w-8 h-8 rounded-full text-xs font-semibold flex items-center justify-center relative transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#7C7CE6] text-white font-bold shadow-xs scale-105'
                        : isCurrentMonth
                        ? 'text-[#242636] hover:bg-[#EDEAFC] hover:text-[#5F5ED4]'
                        : 'text-black/25 hover:bg-black/[0.02]'
                    }`}
                  >
                    <span>{dayNumber}</span>
                    {isToday && !isSelected && (
                      <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#7C7CE6]" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Bottom Quick Button: Hari Ini */}
            <div className="pt-2 border-t border-black/[0.05] flex items-center justify-between">
              <button
                type="button"
                onClick={handleSelectToday}
                className="text-[11px] font-bold text-[#5F5ED4] hover:underline cursor-pointer"
              >
                Hari Ini
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-[11px] font-semibold text-[#757A95] hover:text-[#242636] cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
