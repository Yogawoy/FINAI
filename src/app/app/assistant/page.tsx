'use client';

import React, { useState, useEffect } from 'react';
import PageTransition from '@/components/loading/PageTransition';
import AIChatSkeleton from '@/components/loading/AIChatSkeleton';
import { AIAssistantPage } from '@/components/ai';

export default function AssistantRoute() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <AIChatSkeleton />;
  }

  return (
    <PageTransition>
      <AIAssistantPage />
    </PageTransition>
  );
}
