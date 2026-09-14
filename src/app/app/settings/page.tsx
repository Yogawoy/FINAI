'use client';

import React from 'react';
import PageTransition from '@/components/loading/PageTransition';
import { SettingsPage } from '@/components/settings';

export default function SettingsRoute() {
  return (
    <PageTransition>
      <SettingsPage />
    </PageTransition>
  );
}
