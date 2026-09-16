import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Wallet,
  PieChart,
  Target,
  BarChart3,
  Settings,
  ChevronRight,
  LogOut,
  User,
} from 'lucide-react-native';
import { colors, spacing, radii } from '../../constants/theme';
import Text from '../../components/ui/Text';
import Card from '../../components/ui/Card';
import useAuth from '../../hooks/useAuth';

interface MenuItemConfig {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ size: number; color: string }>;
  badgeColor: string;
}

const MENU_ITEMS: MenuItemConfig[] = [
  {
    id: 'wallets',
    title: 'Dompet',
    subtitle: 'Kelola rekening bank, e-wallet, dan uang tunai',
    icon: Wallet,
    badgeColor: colors.iceBlue,
  },
  {
    id: 'budgets',
    title: 'Anggaran',
    subtitle: 'Atur batas pengeluaran per kategori bulanan',
    icon: PieChart,
    badgeColor: colors.softLavender,
  },
  {
    id: 'goals',
    title: 'Target Impian',
    subtitle: 'Rencanakan tabungan untuk barang atau liburan impian',
    icon: Target,
    badgeColor: colors.mint,
  },
  {
    id: 'analytics',
    title: 'Analisis',
    subtitle: 'Laporan visual arus kas dan tren keuangan',
    icon: BarChart3,
    badgeColor: colors.softCoral,
  },
  {
    id: 'settings',
    title: 'Pengaturan',
    subtitle: 'Preferensi notifikasi, mata uang, dan profil',
    icon: Settings,
    badgeColor: colors.surfaceSubtle,
  },
];

export default function MoreScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text variant="title" weight="black" color={colors.text}>
            Menu FinAI
          </Text>
        </View>

        {/* Profile Card */}
        <Card variant="flat" padding="md" style={styles.profileCard}>
          <View style={styles.avatarBadge}>
            <User size={24} color={colors.primary} />
          </View>
          <View style={styles.profileInfo}>
            <Text variant="body" weight="bold" color={colors.text}>
              {user?.name || 'Pengguna FinAI'}
            </Text>
            <Text variant="caption" color={colors.secondary}>
              {user?.email || 'Belum terautentikasi'}
            </Text>
          </View>
        </Card>

        {/* Menu Items List */}
        <View style={styles.menuList}>
          {MENU_ITEMS.map((item) => {
            const IconComponent = item.icon;
            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.7}
                style={styles.menuItem}
              >
                <View style={[styles.itemIconBadge, { backgroundColor: item.badgeColor }]}>
                  <IconComponent size={20} color={colors.text} />
                </View>
                <View style={styles.itemTextContainer}>
                  <Text variant="body" weight="semibold" color={colors.text}>
                    {item.title}
                  </Text>
                  <Text variant="caption" color={colors.secondary} numberOfLines={1}>
                    {item.subtitle}
                  </Text>
                </View>
                <ChevronRight size={18} color={colors.muted} />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Logout Option */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleLogout}
          style={styles.logoutButton}
        >
          <View style={styles.logoutIconBadge}>
            <LogOut size={18} color={colors.danger} />
          </View>
          <Text variant="body" weight="semibold" color={colors.danger} style={styles.logoutText}>
            Keluar dari Akun
          </Text>
        </TouchableOpacity>

        {/* App Version Info */}
        <View style={styles.versionContainer}>
          <Text variant="label" color={colors.muted} align="center">
            FinAI Mobile Foundation • v1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base,
    paddingBottom: spacing.xxl,
  },
  header: {
    marginBottom: spacing.base,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatarBadge: {
    width: 48,
    height: 48,
    borderRadius: radii.full,
    backgroundColor: colors.softLavender,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  profileInfo: {
    flex: 1,
  },
  menuList: {
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemIconBadge: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  itemTextContainer: {
    flex: 1,
    marginRight: spacing.sm,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  logoutIconBadge: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    backgroundColor: colors.dangerLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  logoutText: {
    flex: 1,
  },
  versionContainer: {
    paddingVertical: spacing.md,
  },
});
