'use client';

import React, { useState, useEffect } from 'react';
import PageTransition from '@/components/loading/PageTransition';
import { SettingsPage, SettingsSkeleton } from '@/components/settings';

export default function SettingsRoute() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <SettingsSkeleton />;
  }

  return (
    <PageTransition>
      <SettingsPage />
    </PageTransition>
  );
}
