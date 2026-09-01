'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Plus, Sparkles } from 'lucide-react';

interface AIInputProps {
  onSendMessage: (text: string) => void;
  disabled?: boolean;
  onOpenPresets?: () => void;
}

export default function AIInput({
  onSendMessage,
  disabled = false,
  onOpenPresets,
}: AIInputProps) {
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || disabled) return;
    onSendMessage(text.trim());
    setText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="w-full">
      <form
        onSubmit={handleSubmit}
        className="h-16 sm:h-[68px] px-3 sm:px-4 rounded-[22px] bg-white/95 backdrop-blur-md border border-[#E8EAF2] shadow-[0_12px_40px_rgba(36,38,54,0.1)] flex items-center gap-2 sm:gap-3 transition-all focus-within:border-[#7C7CE6] focus-within:ring-2 focus-within:ring-[#7C7CE6]/20"
      >
        {/* Optional quick preset opener */}
        {onOpenPresets && (
          <button
            type="button"
            onClick={onOpenPresets}
            aria-label="Ide percakapan"
            className="w-9 h-9 rounded-xl bg-[#FAFBFD] border border-black/[0.04] text-[#757A95] hover:text-[#7C7CE6] hover:bg-[#EDEAFC] transition-colors flex items-center justify-center shrink-0 cursor-pointer"
          >
            <Plus size={16} />
          </button>
        )}

        {/* Input Field */}
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Ceritakan transaksi atau tanyakan sesuatu..."
          className="flex-1 bg-transparent text-xs sm:text-sm text-[#242636] placeholder-[#A0A4B8] focus:outline-none disabled:opacity-60"
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={!text.trim() || disabled}
          aria-label="Kirim pesan"
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#7C7CE6] hover:bg-[#6867D4] active:scale-95 text-white flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs shrink-0"
        >
          <Send size={15} />
        </button>
      </form>
    </div>
  );
}
