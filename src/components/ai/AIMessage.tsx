'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { AIMessage as AIMessageType } from '@/types';
import AIFinancialActionCard from './AIFinancialActionCard';
import AIInsightCard from './AIInsightCard';
import AIError from './AIError';

interface AIMessageProps {
  message: AIMessageType;
  onConfirmAction: (actionId: string) => void;
  onCancelAction: (actionId: string) => void;
  onRetry?: () => void;
}

export default function AIMessage({
  message,
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

      {/* Message Content Area */}
      <div className="max-w-[90%] sm:max-w-[75%] space-y-3">
        {/* Text paragraph */}
        {message.content && (
          <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-white border border-[#E8EAF2] text-[#242636] text-xs sm:text-sm leading-relaxed shadow-2xs whitespace-pre-line">
            {message.content}
          </div>
        )}

        {/* Structured Financial Action Card */}
        {message.action && (
          <AIFinancialActionCard
            action={message.action}
            onConfirm={onConfirmAction}
            onCancel={onCancelAction}
          />
        )}

        {/* Financial Insight Card */}
        {message.insight && <AIInsightCard insight={message.insight} />}

        {/* Error State */}
        {message.error && <AIError message={message.content} onRetry={onRetry} />}

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
