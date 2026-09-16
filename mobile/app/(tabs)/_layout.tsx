import React from 'react';
import { Tabs } from 'expo-router';
import { LayoutDashboard, ArrowLeftRight, Sparkles, Menu } from 'lucide-react-native';
import { colors, typography, shadows, spacing } from '../../constants/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.secondary,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: spacing.sm,
          paddingTop: spacing.xs,
          ...shadows.dock,
        },
        tabBarLabelStyle: {
          fontSize: typography.sizes.xxs,
          fontWeight: typography.weights.semibold,
          marginTop: -2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <LayoutDashboard size={size || 22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Transaksi',
          tabBarIcon: ({ color, size }) => <ArrowLeftRight size={size || 22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="ai"
        options={{
          title: 'AI',
          tabBarIcon: ({ color, size }) => <Sparkles size={size || 22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'Lainnya',
          tabBarIcon: ({ color, size }) => <Menu size={size || 22} color={color} />,
        }}
      />
    </Tabs>
  );
}
