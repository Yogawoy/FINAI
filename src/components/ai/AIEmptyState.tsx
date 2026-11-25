'use client';

import React from 'react';
import AIQuickActions from './AIQuickActions';

interface AIEmptyStateProps {
  onSelectAction: (prompt: string) => void;
}

export default function AIEmptyState({ onSelectAction }: AIEmptyStateProps) {
  return (
    <div className="py-4 max-w-2xl mx-auto">
      <AIQuickActions onSelectAction={onSelectAction} />
    </div>
  );
}
