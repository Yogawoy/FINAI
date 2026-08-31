'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Check } from 'lucide-react';

interface TimePickerProps {
  value: string; // e.g. "18:42" or "12:45"
  onChange: (val: string) => void;
  label?: string;
  className?: string;
  error?: string;
}

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

const QUICK_PRESETS = [
  { label: 'Pagi', time: '08:00' },
  { label: 'Siang', time: '12:30' },
  { label: 'Sore', time: '16:00' },
  { label: 'Malam', time: '19:30' },
];

export default function TimePicker({
  value,
  onChange,
  label,
  className = '',
  error,
}: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hoursListRef = useRef<HTMLDivElement>(null);
  const minutesListRef = useRef<HTMLDivElement>(null);

  // Parse hour and minute
  const [selectedHour, setSelectedHour] = useState(() => {
    if (!value) return '12';
    const parts = value.split(':');
    return parts[0] ? parts[0].padStart(2, '0') : '12';
  });

  const [selectedMinute, setSelectedMinute] = useState(() => {
    if (!value) return '00';
    const parts = value.split(':');
    return parts[1] ? parts[1].slice(0, 2).padStart(2, '0') : '00';
  });

  useEffect(() => {
    if (value) {
      const parts = value.split(':');
      if (parts[0]) setSelectedHour(parts[0].padStart(2, '0'));
      if (parts[1]) setSelectedMinute(parts[1].slice(0, 2).padStart(2, '0'));
    }
  }, [value]);

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

  const handleApply = (h = selectedHour, m = selectedMinute) => {
    onChange(`${h}:${m}`);
    setIsOpen(false);
  };

  const handleSelectNow = () => {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    setSelectedHour(h);
    setSelectedMinute(m);
    handleApply(h, m);
  };

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
          <Clock size={15} className="text-[#7C7CE6] shrink-0" />
          <span className="truncate font-semibold text-[#242636]">
            {value || '12:00'}
          </span>
        </div>
      </button>

      {error && (
        <p className="text-[10px] font-semibold text-[#B83A38] pl-0.5">{error}</p>
      )}

      {/* Custom Time Picker Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute left-0 top-full mt-1.5 p-3.5 bg-white border border-black/[0.08] rounded-2xl shadow-[0_14px_35px_rgba(36,38,54,0.14)] z-50 w-[260px] sm:w-[270px] space-y-3"
          >
            {/* Header & Digital Display */}
            <div className="flex items-center justify-between border-b border-black/[0.05] pb-2">
              <span className="text-[11px] font-bold text-[#757A95] uppercase tracking-wider">
                Waktu
              </span>
              <div className="flex items-center gap-1 text-sm font-extrabold text-[#242636] bg-[#EDEAFC]/60 px-2.5 py-0.5 rounded-lg">
                <span>{selectedHour}</span>
                <span>:</span>
                <span>{selectedMinute}</span>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1">
              {QUICK_PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => {
                    const [h, m] = p.time.split(':');
                    setSelectedHour(h);
                    setSelectedMinute(m);
                  }}
                  className="flex-1 py-1 rounded-lg text-[10px] font-bold bg-[#F8F9FD] hover:bg-[#EDEAFC] hover:text-[#5F5ED4] text-[#757A95] transition-colors cursor-pointer text-center"
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Two Scrollable Columns: Jam (Hours) & Menit (Minutes) */}
            <div className="grid grid-cols-2 gap-2 text-center">
              {/* Jam Column */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-[#757A95] uppercase tracking-wider block">
                  Jam
                </span>
                <div
                  ref={hoursListRef}
                  className="h-32 overflow-y-auto rounded-xl bg-[#F8F9FD] p-1 space-y-1 border border-black/[0.04]"
                >
                  {HOURS.map((h) => {
                    const isSelected = h === selectedHour;
                    return (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setSelectedHour(h)}
                        className={`w-full py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#7C7CE6] text-white font-bold shadow-2xs'
                            : 'text-[#242636] hover:bg-[#EDEAFC] hover:text-[#5F5ED4]'
                        }`}
                      >
                        {h}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Menit Column */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-[#757A95] uppercase tracking-wider block">
                  Menit
                </span>
                <div
                  ref={minutesListRef}
                  className="h-32 overflow-y-auto rounded-xl bg-[#F8F9FD] p-1 space-y-1 border border-black/[0.04]"
                >
                  {MINUTES.map((m) => {
                    const isSelected = m === selectedMinute;
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setSelectedMinute(m)}
                        className={`w-full py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#7C7CE6] text-white font-bold shadow-2xs'
                            : 'text-[#242636] hover:bg-[#EDEAFC] hover:text-[#5F5ED4]'
                        }`}
                      >
                        {m}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Actions: Sekarang & Selesai */}
            <div className="pt-2 border-t border-black/[0.05] flex items-center justify-between">
              <button
                type="button"
                onClick={handleSelectNow}
                className="text-[11px] font-bold text-[#5F5ED4] hover:underline cursor-pointer"
              >
                Sekarang
              </button>

              <button
                type="button"
                onClick={() => handleApply()}
                className="py-1.5 px-3.5 rounded-xl bg-[#7C7CE6] hover:bg-[#6D6CD8] text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1"
              >
                <Check size={13} />
                <span>Selesai</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
