'use client';

import React from 'react';
import {
  Utensils,
  Car,
  ShoppingBag,
  Zap,
  Package,
  Film,
  Heart,
  BookOpen,
  Users,
  CreditCard,
  Smartphone,
  Building,
  Gift,
  Briefcase,
  Sparkles,
  TrendingUp,
  Laptop,
  Plane,
  ShieldCheck,
  Bike,
  Home,
  GraduationCap,
  Landmark,
  Store,
} from 'lucide-react';
import { normalizeGoalCategory, normalizeTransactionCategory } from '@/lib/categories';

export function renderTransactionCategoryIcon(
  category?: string | null,
  size = 18,
  className?: string
): React.ReactNode {
  const canonical = normalizeTransactionCategory(category);
  const props = className ? { size, className } : { size };

  switch (canonical) {
    case 'food':
      return <Utensils {...props} />;
    case 'transport':
      return <Car {...props} />;
    case 'shopping':
      return <ShoppingBag {...props} />;
    case 'bills':
      return <Zap {...props} />;
    case 'daily_needs':
      return <Package {...props} />;
    case 'housing':
      return <Home {...props} />;
    case 'entertainment':
      return <Film {...props} />;
    case 'health':
      return <Heart {...props} />;
    case 'education':
      return <BookOpen {...props} />;
    case 'social':
      return <Users {...props} />;
    case 'debt':
      return <CreditCard {...props} />;
    case 'electronics':
      return <Smartphone {...props} />;
    case 'salary':
      return <Building {...props} />;
    case 'freelance':
      return <Sparkles {...props} />;
    case 'bonus':
      return <Gift {...props} />;
    case 'business':
      return <Briefcase {...props} />;
    case 'investment':
      return <TrendingUp {...props} />;
    default:
      return <Sparkles {...props} />;
  }
}

export function renderGoalCategoryIcon(
  category?: string | null,
  size = 20,
  strokeWidth = 2.2
): React.ReactNode {
  const canonical = normalizeGoalCategory(category);

  switch (canonical) {
    case 'laptop':
      return <Laptop size={size} strokeWidth={strokeWidth} />;
    case 'travel':
      return <Plane size={size} strokeWidth={strokeWidth} />;
    case 'emergency':
      return <ShieldCheck size={size} strokeWidth={strokeWidth} />;
    case 'vehicle':
      return <Bike size={size} strokeWidth={strokeWidth} />;
    case 'home':
      return <Home size={size} strokeWidth={strokeWidth} />;
    case 'course':
      return <GraduationCap size={size} strokeWidth={strokeWidth} />;
    case 'wedding':
      return <Heart size={size} strokeWidth={strokeWidth} />;
    case 'worship':
      return <Landmark size={size} strokeWidth={strokeWidth} />;
    case 'business':
      return <Store size={size} strokeWidth={strokeWidth} />;
    default:
      return <Sparkles size={size} strokeWidth={strokeWidth} />;
  }
}
