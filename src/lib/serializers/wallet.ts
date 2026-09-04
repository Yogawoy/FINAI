import { Prisma, Wallet } from '@prisma/client';

export interface SerializedWallet {
  id: string;
  userId: string;
  name: string;
  type: Wallet['type'];
  institution: string | null;
  accountLast4: string | null;
  balance: string;
  color: string | null;
  icon: string | null;
  createdAt: string;
  updatedAt: string;
}

function formatDecimal(value: Prisma.Decimal): string {
  return value.toFixed(2);
}

export function serializeWallet(wallet: {
  id: string;
  userId: string;
  name: string;
  type: Wallet['type'];
  institution: string | null;
  accountLast4: string | null;
  balance: Prisma.Decimal;
  color: string | null;
  icon: string | null;
  createdAt: Date;
  updatedAt: Date;
}): SerializedWallet {
  return {
    id: wallet.id,
    userId: wallet.userId,
    name: wallet.name,
    type: wallet.type,
    institution: wallet.institution,
    accountLast4: wallet.accountLast4,
    balance: formatDecimal(wallet.balance),
    color: wallet.color,
    icon: wallet.icon,
    createdAt: wallet.createdAt.toISOString(),
    updatedAt: wallet.updatedAt.toISOString(),
  };
}

export function serializeWallets(wallets: Array<Parameters<typeof serializeWallet>[0]>): SerializedWallet[] {
  return wallets.map(serializeWallet);
}
