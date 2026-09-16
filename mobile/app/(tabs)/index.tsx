import React from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Sparkles, Wallet, ArrowUpRight, ArrowDownLeft, Lightbulb } from 'lucide-react-native';
import { colors, spacing, radii } from '../../constants/theme';
import Text from '../../components/ui/Text';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import useAuth from '../../hooks/useAuth';

export default function HomeScreen() {
  const { user } = useAuth();

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Greeting Header */}
        <View style={styles.header}>
          <View>
            <Text variant="title" weight="black" color={colors.text}>
              FinAI
            </Text>
            <Text variant="caption" color={colors.secondary}>
              Selamat datang, {user?.name || 'Pengguna'}
            </Text>
          </View>
          <View style={styles.headerBadge}>
            <Sparkles size={18} color={colors.primary} />
          </View>
        </View>

        {/* Hero Card: Total Saldo */}
        <Card variant="default" padding="lg" style={styles.heroCard}>
          <Text variant="caption" color={colors.secondary} weight="medium">
            Total Saldo
          </Text>
          <Text variant="display" weight="black" color={colors.text} style={styles.balanceText}>
            Rp0
          </Text>

          <View style={styles.quickActionsRow}>
            <View style={styles.quickStat}>
              <View style={[styles.statIconBadge, { backgroundColor: colors.mint }]}>
                <ArrowDownLeft size={16} color={colors.success} />
              </View>
              <View>
                <Text variant="label" color={colors.secondary}>Pemasukan</Text>
                <Text variant="caption" weight="bold" color={colors.text}>Rp0</Text>
              </View>
            </View>

            <View style={styles.quickStat}>
              <View style={[styles.statIconBadge, { backgroundColor: colors.softCoral }]}>
                <ArrowUpRight size={16} color={colors.danger} />
              </View>
              <View>
                <Text variant="label" color={colors.secondary}>Pengeluaran</Text>
                <Text variant="caption" weight="bold" color={colors.text}>Rp0</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Section: Dompet */}
        <View style={styles.sectionHeader}>
          <Text variant="subtitle" weight="bold" color={colors.text}>
            Dompet
          </Text>
          <Text variant="caption" weight="semibold" color={colors.primary}>
            Kelola
          </Text>
        </View>
        <Card variant="flat" padding="md" style={styles.sectionCard}>
          <View style={styles.emptyWalletRow}>
            <View style={styles.walletIconBadge}>
              <Wallet size={20} color={colors.primary} />
            </View>
            <View style={styles.emptyWalletText}>
              <Text variant="caption" weight="semibold" color={colors.text}>
                Belum ada dompet terhubung
              </Text>
              <Text variant="label" color={colors.secondary}>
                Siapkan dompet bank, e-wallet, atau tunai
              </Text>
            </View>
          </View>
        </Card>

        {/* Section: Transaksi Terbaru */}
        <View style={styles.sectionHeader}>
          <Text variant="subtitle" weight="bold" color={colors.text}>
            Transaksi Terbaru
          </Text>
          <Text variant="caption" weight="semibold" color={colors.primary}>
            Lihat Semua
          </Text>
        </View>
        <Card variant="default" padding="sm" style={styles.sectionCard}>
          <EmptyState
            title="Belum ada transaksi"
            description="Catat pemasukan atau pengeluaran pertamamu untuk mulai memantau arus kas."
          />
        </Card>

        {/* Section: Insight FinAI */}
        <View style={styles.sectionHeader}>
          <Text variant="subtitle" weight="bold" color={colors.text}>
            Insight FinAI
          </Text>
        </View>
        <Card variant="accent" padding="md" style={styles.sectionCard}>
          <View style={styles.insightHeader}>
            <Lightbulb size={18} color={colors.primary} />
            <Text variant="caption" weight="bold" color={colors.primaryDark} style={styles.insightTitle}>
              Tips Finansial Cerdas
            </Text>
          </View>
          <Text variant="caption" color={colors.text} style={styles.insightBody}>
            Mulai dengan menyusun pos anggaran bulanan agar pengeluaran harianmu tetap terencana dan terukur.
          </Text>
        </Card>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.base,
  },
  headerBadge: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    backgroundColor: colors.softLavender,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCard: {
    marginBottom: spacing.lg,
  },
  balanceText: {
    marginVertical: spacing.xs,
    fontSize: 30,
  },
  quickActionsRow: {
    flexDirection: 'row',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    justifyContent: 'space-between',
  },
  quickStat: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statIconBadge: {
    width: 32,
    height: 32,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.base,
    marginBottom: spacing.sm,
  },
  sectionCard: {
    marginBottom: spacing.sm,
  },
  emptyWalletRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  walletIconBadge: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  emptyWalletText: {
    flex: 1,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  insightTitle: {
    marginLeft: spacing.xs,
  },
  insightBody: {
    lineHeight: 20,
  },
});
