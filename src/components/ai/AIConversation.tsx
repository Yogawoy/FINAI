'use client';

import React, { useRef, useEffect } from 'react';
import { AIMessage as AIMessageType } from '@/types';
import UserMessage from './UserMessage';
import AIMessage from './AIMessage';
import AIThinking from './AIThinking';
import AIEmptyState from './AIEmptyState';

interface AIConversationProps {
  messages: AIMessageType[];
  isThinking: boolean;
  confirmingIds?: Set<string>;
  onConfirmAction: (actionId: string) => void;
  onCancelAction: (actionId: string) => void;
  onSelectAction: (prompt: string) => void;
  onRetry?: () => void;
}

export default function AIConversation({
  messages,
  isThinking,
  confirmingIds,
  onConfirmAction,
  onCancelAction,
  onSelectAction,
  onRetry,
}: AIConversationProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  if (messages.length === 0) {
    return <AIEmptyState onSelectAction={onSelectAction} />;
  }

  return (
    <div className="space-y-6 pb-4">
      {messages.map((msg) => {
        if (msg.sender === 'user') {
          return (
            <UserMessage
              key={msg.id}
              content={msg.content}
              timestamp={msg.timestamp}
            />
          );
        }

        const isConfirming = msg.action ? confirmingIds?.has(msg.action.id) ?? false : false;
        return (
          <AIMessage
            key={msg.id}
            message={msg}
            isConfirming={isConfirming}
            onConfirmAction={onConfirmAction}
            onCancelAction={onCancelAction}
            onRetry={onRetry}
          />
        );
      })}

      {/* Thinking Indicator */}
      {isThinking && <AIThinking />}

      <div ref={bottomRef} />
    </div>
  );
}
