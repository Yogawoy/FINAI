'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SidebarGroupHeader from './SidebarGroupHeader';

interface SidebarGroupProps {
  id: string;
  title: string;
  isCollapsible?: boolean;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export default function SidebarGroup({
  id,
  title,
  isCollapsible = true,
  isOpen,
  onToggle,
  children,
}: SidebarGroupProps) {
  const contentId = `sidebar-group-content-${id}`;

  return (
    <div className="space-y-1">
      <SidebarGroupHeader
        title={title}
        isCollapsible={isCollapsible}
        isOpen={isOpen}
        controlsId={contentId}
        onToggle={onToggle}
      />

      {isCollapsible ? (
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              id={contentId}
              key={contentId}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="overflow-hidden space-y-1 pt-0.5"
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      ) : (
        <div id={contentId} className="space-y-1 pt-0.5">
          {children}
        </div>
      )}
    </div>
  );
}
