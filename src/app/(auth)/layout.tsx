import React from 'react';
import AuthSplitShell from '@/components/auth/AuthSplitShell';

export default function AuthGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AuthSplitShell />
      {children}
    </>
  );
}
