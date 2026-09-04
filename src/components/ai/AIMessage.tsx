'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { AIMessage as AIMessageType } from '@/types';
import AIResponseRenderer from './AIResponseRenderer';

interface AIMessageProps {
  message: AIMessageType;
  isConfirming?: boolean;
  onConfirmAction: (actionId: string) => void;
  onCancelAction: (actionId: string) => void;
  onRetry?: () => void;
}

export default function AIMessage({
  message,
  isConfirming = false,
  onConfirmAction,
  onCancelAction,
  onRetry,
}: AIMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="flex items-start gap-3 justify-start"
    >
      {/* AI Avatar Icon */}
      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#7C7CE6] to-[#8C8BE8] text-white flex items-center justify-center shadow-xs shrink-0 mt-0.5">
        <Sparkles size={15} />
      </div>

      {/* Message Content Area — centralized renderer for all card types */}
      <div className="max-w-[90%] sm:max-w-[75%] space-y-3">
        <AIResponseRenderer
          message={message}
          isConfirming={isConfirming}
          onConfirmAction={onConfirmAction}
          onCancelAction={onCancelAction}
          onRetry={onRetry}
        />

        {/* Timestamp */}
        {message.timestamp && (
          <span className="block text-[10px] text-[#A0A4B8] pl-1">
            {message.timestamp}
          </span>
        )}
      </div>
    </motion.div>
  );
}
