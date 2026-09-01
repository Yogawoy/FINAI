'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Receipt,
  Wallet,
  ChartNoAxesCombined,
  Target,
  ChartLine,
  Sparkles,
  Settings,
  ArrowUpRight,
  LucideIcon,
} from 'lucide-react';

import SidebarBrand from './SidebarBrand';
import SidebarGroup from './SidebarGroup';
import SidebarItem from './SidebarItem';
import SidebarProfile from './SidebarProfile';
import SidebarMobileDrawer from './SidebarMobileDrawer';

export interface NavItemConfig {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  hasActivityDot?: boolean;
}

export interface NavGroupConfig {
  id: string;
  title: string;
  isCollapsible?: boolean;
  items: NavItemConfig[];
}

export const NAVIGATION_GROUPS: NavGroupConfig[] = [
  {
    id: 'main',
    title: 'UTAMA',
    isCollapsible: false,
    items: [
      {
        id: 'overview',
        label: 'Beranda',
        href: '/app',
        icon: LayoutDashboard,
      },
    ],
  },
  {
    id: 'finance',
    title: 'KEUANGAN',
    isCollapsible: true,
    items: [
      {
        id: 'transactions',
        label: 'Transaksi',
        href: '/app/transactions',
        icon: Receipt,
      },
      {
        id: 'wallets',
        label: 'Dompet',
        href: '/app/wallets',
        icon: Wallet,
      },
    ],
  },
  {
    id: 'planning',
    title: 'PERENCANAAN',
    isCollapsible: true,
    items: [
      {
        id: 'budgets',
        label: 'Anggaran',
        href: '/app/budgets',
        icon: ChartNoAxesCombined,
      },
      {
        id: 'goals',
        label: 'Target Impian',
        href: '/app/goals',
        icon: Target,
      },
    ],
  },
  {
    id: 'insight',
    title: 'INSIGHT',
    isCollapsible: true,
    items: [
      {
        id: 'analytics',
        label: 'Analisis',
        href: '/app/analytics',
        icon: ChartLine,
      },
      {
        id: 'ai-assistant',
        label: 'Asisten FinAI',
        href: '/app/ai-assistant',
        icon: Sparkles,
        hasActivityDot: true,
      },
    ],
  },
  {
    id: 'system',
    title: 'SISTEM',
    isCollapsible: true,
    items: [
      {
        id: 'settings',
        label: 'Pengaturan',
        href: '/app/settings',
        icon: Settings,
      },
    ],
  },
];

const STORAGE_KEY = 'finai-sidebar-groups';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Listen for global open mobile sidebar events (from Header or mobile controls)
  useEffect(() => {
    const handleOpenMobile = () => setIsMobileOpen(true);
    window.addEventListener('open-mobile-sidebar', handleOpenMobile);
    return () => window.removeEventListener('open-mobile-sidebar', handleOpenMobile);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Find which group contains the current active route
  const activeGroupId = useMemo(() => {
    for (const group of NAVIGATION_GROUPS) {
      for (const item of group.items) {
        if (item.href === '/app' && pathname === '/app') return group.id;
        if (item.href !== '/app' && (pathname === item.href || pathname.startsWith(item.href))) {
          return group.id;
        }
        if (item.id === 'ai-assistant' && pathname.startsWith('/app/assistant')) {
          return group.id;
        }
      }
    }
    return 'main';
  }, [pathname]);

  // Initial group open states
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    finance: true,
    planning: true,
    insight: true,
    system: true,
  });

  // Load persistence from localStorage and ensure active group is always open
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setOpenGroups((prev) => ({
          ...prev,
          ...parsed,
          [activeGroupId]: true,
        }));
        return;
      }
    } catch {
      // Ignore storage errors
    }
    setOpenGroups((prev) => ({ ...prev, [activeGroupId]: true }));
  }, [activeGroupId]);

  const toggleGroup = (groupId: string) => {
    setOpenGroups((prev) => {
      const nextState = { ...prev, [groupId]: !prev[groupId] };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
      } catch {
        // Ignore quota error
      }
      return nextState;
    });
  };

  const isItemActive = (href: string, id: string) => {
    if (href === '/app') return pathname === '/app';
    if (id === 'ai-assistant') {
      return pathname.startsWith('/app/ai-assistant') || pathname.startsWith('/app/assistant');
    }
    return pathname === href || pathname.startsWith(href);
  };

  // Reusable content rendered both in desktop sidebar and mobile drawer
  const renderNavContent = (onItemClick?: () => void) => (
    <>
      {/* Brand */}
      <div>
        <SidebarBrand />
      </div>

      {/* Grouped Navigation */}
      <nav
        className="flex-1 overflow-y-auto py-5 space-y-4 pr-0.5 custom-scrollbar"
        aria-label="Navigasi Utama"
      >
        {NAVIGATION_GROUPS.map((group) => {
          const isGroupOpen = group.isCollapsible ? !!openGroups[group.id] : true;

          return (
            <SidebarGroup
              key={group.id}
              id={group.id}
              title={group.title}
              isCollapsible={group.isCollapsible}
              isOpen={isGroupOpen}
              onToggle={() => toggleGroup(group.id)}
            >
              {group.items.map((item) => {
                const active = isItemActive(item.href, item.id);
                return (
                  <SidebarItem
                    key={item.id}
                    label={item.label}
                    href={item.href}
                    icon={item.icon}
                    isActive={active}
                    isNested={group.isCollapsible}
                    hasActivityDot={item.hasActivityDot}
                    onClick={onItemClick}
                  />
                );
              })}
            </SidebarGroup>
          );
        })}
      </nav>

      {/* Bottom: Landing Showcase Link & Profile */}
      <div className="pt-3 border-t border-[#E8EAF2]/70 space-y-2.5">
        <Link
          href="/"
          onClick={onItemClick}
          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-[#757A95] hover:text-[#242636] hover:bg-[#F0EFFC] transition-colors"
        >
          <span className="flex items-center gap-2">
            <ArrowUpRight size={14} className="text-[#7C7CE6]" />
            <span>Halaman Depan</span>
          </span>
          <span className="px-1.5 py-0.5 rounded-md bg-[#EBF7F2] text-[10px] font-bold text-[#1B7354]">
            Aktif
          </span>
        </Link>

        <SidebarProfile
          name="Yoga W."
          tier="Member FinAI Pro"
          initials="YW"
          onLogout={() => router.push('/login')}
        />
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Floating Sidebar */}
      <aside className="hidden lg:flex flex-col w-68 h-screen fixed left-0 top-0 p-5 z-30 pointer-events-none">
        <div className="w-full h-full glass-panel rounded-3xl p-4.5 flex flex-col justify-between pointer-events-auto shadow-[0_8px_32px_rgba(48,51,74,0.04)] border border-white/90 bg-white/95 backdrop-blur-md select-none">
          {renderNavContent()}
        </div>
      </aside>

      {/* Mobile Drawer Sidebar */}
      <SidebarMobileDrawer
        isOpen={isMobileOpen}
        onClose={() => setIsMobileOpen(false)}
      >
        {renderNavContent(() => setIsMobileOpen(false))}
      </SidebarMobileDrawer>
    </>
  );
}
