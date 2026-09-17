import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Sparkles,
  Wallet as WalletIcon,
  Landmark,
  Smartphone,
  Banknote,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  ArrowLeftRight,
  Target,
  PieChart,
  ChevronRight,
  TrendingDown,
  TrendingUp,
} from 'lucide-react-native';
import { colors, spacing, radii } from '../../constants/theme';
import Text from '../../components/ui/Text';
import Card from '../../components/ui/Card';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import useAuth from '../../hooks/useAuth';
import useDashboardData from '../../hooks/useDashboardData';
import { formatIDR, formatRelativeDate, parseDecimal } from '../../lib/format';
import type { Wallet, WalletType } from '../../types/common';

function getWalletIcon(type: WalletType) {
  switch (type) {
    case 'BANK':
      return Landmark;
    case 'E_WALLET':
      return Smartphone;
    case 'CASH':
      return Banknote;
    default:
      return WalletIcon;
  }
}

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    wallets,
    recentTransactions,
    budgets,
    goals,
    totalBalance,
    monthlyIncome,
    monthlyExpense,
    isLoading,
    isRefreshing,
    error,
    refresh,
  } = useDashboardData();

  // Initial Full Loading Screen
  if (isLoading && !isRefreshing) {
    return (
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <LoadingState message="Memuat ringkasan keuangan..." />
        </View>
      </SafeAreaView>
    );
  }

  // Error Screen when initial fetch fails completely
  if (error && wallets.length === 0 && recentTransactions.length === 0) {
    return (
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <ErrorState
            title="Data belum dapat dimuat"
            message={error}
            retryLabel="Coba Lagi"
            onRetry={refresh}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* 1. Header Greeting */}
        <View style={styles.header}>
          <View style={styles.headerInfo}>
            <Text variant="caption" color={colors.secondary} weight="medium">
              Selamat datang kembali,
            </Text>
            <Text variant="title" weight="black" color={colors.text} numberOfLines={1}>
              {user?.name || 'Pengguna FinAI'}
            </Text>
          </View>
          <View style={styles.headerBadge}>
            <Sparkles size={20} color={colors.primary} />
          </View>
        </View>

        {/* 2. Total Balance Hero Card */}
        <Card variant="default" padding="lg" style={styles.heroCard}>
          <Text variant="caption" color={colors.secondary} weight="semibold">
            TOTAL SALDO
          </Text>
          <Text variant="display" weight="black" color={colors.text} style={styles.balanceText}>
            {formatIDR(totalBalance)}
          </Text>

          {/* Monthly Income & Expense Summary */}
          <View style={styles.incomeExpenseRow}>
            <View style={styles.statBox}>
              <View style={[styles.statIconBadge, { backgroundColor: colors.mint }]}>
                <ArrowDownLeft size={16} color={colors.success} />
              </View>
              <View style={styles.statContent}>
                <Text variant="label" color={colors.secondary}>
                  Pemasukan Bulan Ini
                </Text>
                <Text variant="body" weight="bold" color={colors.success}>
                  {formatIDR(monthlyIncome)}
                </Text>
              </View>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statBox}>
              <View style={[styles.statIconBadge, { backgroundColor: colors.softCoral }]}>
                <ArrowUpRight size={16} color={colors.danger} />
              </View>
              <View style={styles.statContent}>
                <Text variant="label" color={colors.secondary}>
                  Pengeluaran Bulan Ini
                </Text>
                <Text variant="body" weight="bold" color={colors.danger}>
                  {formatIDR(monthlyExpense)}
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* 3. Quick Actions Row (Navigation only) */}
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/(tabs)/transactions')}
            style={styles.quickActionItem}
          >
            <View style={[styles.actionIconBadge, { backgroundColor: colors.softLavender }]}>
              <Plus size={20} color={colors.primary} />
            </View>
            <Text variant="label" weight="semibold" color={colors.text} style={styles.actionText}>
              Catat
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/(tabs)/transactions')}
            style={styles.quickActionItem}
          >
            <View style={[styles.actionIconBadge, { backgroundColor: colors.iceBlue }]}>
              <ArrowLeftRight size={20} color={colors.primary} />
            </View>
            <Text variant="label" weight="semibold" color={colors.text} style={styles.actionText}>
              Transfer
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/(tabs)/more')}
            style={styles.quickActionItem}
          >
            <View style={[styles.actionIconBadge, { backgroundColor: colors.mint }]}>
              <Target size={20} color={colors.text} />
            </View>
            <Text variant="label" weight="semibold" color={colors.text} style={styles.actionText}>
              Target
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/(tabs)/more')}
            style={styles.quickActionItem}
          >
            <View style={[styles.actionIconBadge, { backgroundColor: colors.surfaceSubtle }]}>
              <PieChart size={20} color={colors.secondary} />
            </View>
            <Text variant="label" weight="semibold" color={colors.text} style={styles.actionText}>
              Anggaran
            </Text>
          </TouchableOpacity>
        </View>

        {/* 4. Dompet / Wallets Preview */}
        <View style={styles.sectionHeader}>
          <Text variant="subtitle" weight="bold" color={colors.text}>
            Dompet & Rekening
          </Text>
          <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/wallets')}>
            <Text variant="caption" weight="bold" color={colors.primary}>
              Lihat Semua
            </Text>
          </TouchableOpacity>
        </View>

        {wallets.length === 0 ? (
          <Card variant="flat" padding="md" style={styles.sectionCard}>
            <EmptyState
              title="Belum ada dompet terhubung"
              description="Hubungkan rekening bank, e-wallet, atau saldo tunai untuk mulai mencatat."
            />
          </Card>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.walletsHorizontalList}
          >
            {wallets.map((wallet: Wallet) => {
              const WalletIconComponent = getWalletIcon(wallet.type);
              return (
                <Card
                  key={wallet.id}
                  variant="default"
                  padding="md"
                  style={styles.walletCardItem}
                >
                  <View style={styles.walletItemTop}>
                    <View style={styles.walletIconCircle}>
                      <WalletIconComponent size={18} color={colors.primary} />
                    </View>
                    <Text variant="label" color={colors.secondary} weight="medium">
                      {wallet.type === 'BANK'
                        ? 'Bank'
                        : wallet.type === 'E_WALLET'
                        ? 'E-Wallet'
                        : 'Tunai'}
                    </Text>
                  </View>
                  <Text variant="body" weight="bold" color={colors.text} numberOfLines={1} style={styles.walletName}>
                    {wallet.name}
                  </Text>
                  <Text variant="caption" color={colors.secondary} numberOfLines={1}>
                    {wallet.institution || (wallet.accountLast4 ? `•••• ${wallet.accountLast4}` : 'Dompet Utama')}
                  </Text>
                  <Text variant="subtitle" weight="black" color={colors.text} style={styles.walletBalance}>
                    {formatIDR(wallet.balance)}
                  </Text>
                </Card>
              );
            })}
          </ScrollView>
        )}

        {/* 5. Transaksi Terbaru */}
        <View style={styles.sectionHeader}>
          <Text variant="subtitle" weight="bold" color={colors.text}>
            Transaksi Terbaru
          </Text>
          <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/(tabs)/transactions')}>
            <Text variant="caption" weight="bold" color={colors.primary}>
              Lihat Semua
            </Text>
          </TouchableOpacity>
        </View>

        {recentTransactions.length === 0 ? (
          <Card variant="flat" padding="md" style={styles.sectionCard}>
            <EmptyState
              title="Belum ada transaksi"
              description="Catat pemasukan atau pengeluaran pertamamu untuk memantau arus kas."
            />
          </Card>
        ) : (
          <Card variant="default" padding="none" style={styles.transactionsCard}>
            {recentTransactions.map((tx, index) => {
              const isIncome = tx.type === 'INCOME';
              const isLast = index === recentTransactions.length - 1;
              return (
                <View
                  key={tx.id}
                  style={[
                    styles.transactionItem,
                    !isLast && styles.transactionBorderBottom,
                  ]}
                >
                  <View
                    style={[
                      styles.txIconBadge,
                      { backgroundColor: isIncome ? colors.mint : colors.softCoral },
                    ]}
                  >
                    {isIncome ? (
                      <TrendingUp size={18} color={colors.success} />
                    ) : (
                      <TrendingDown size={18} color={colors.danger} />
                    )}
                  </View>

                  <View style={styles.txDetails}>
                    <Text variant="body" weight="semibold" color={colors.text} numberOfLines={1}>
                      {tx.description}
                    </Text>
                    <Text variant="label" color={colors.secondary}>
                      {tx.category} • {formatRelativeDate(tx.transactionDate)}
                    </Text>
                  </View>

                  <Text
                    variant="body"
                    weight="bold"
                    color={isIncome ? colors.success : colors.danger}
                    style={styles.txAmount}
                  >
                    {isIncome ? '+ ' : '- '}
                    {formatIDR(tx.amount)}
                  </Text>
                </View>
              );
            })}
          </Card>
        )}

        {/* 6. Anggaran Bulanan Preview */}
        <View style={styles.sectionHeader}>
          <Text variant="subtitle" weight="bold" color={colors.text}>
            Ringkasan Anggaran
          </Text>
          <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/(tabs)/more')}>
            <Text variant="caption" weight="bold" color={colors.primary}>
              Atur
            </Text>
          </TouchableOpacity>
        </View>

        {budgets.length === 0 ? (
          <Card variant="flat" padding="md" style={styles.sectionCard}>
            <EmptyState
              title="Belum ada pos anggaran"
              description="Tetapkan batas pengeluaran kategori bulanan agar tidak overbudget."
            />
          </Card>
        ) : (
          <Card variant="default" padding="md" style={styles.sectionCard}>
            {budgets.slice(0, 3).map((budget, index) => {
              const used = parseDecimal(budget.usedAmount);
              const limit = parseDecimal(budget.limitAmount);
              const pct = limit > 0 ? Math.min(Math.round((used / limit) * 100), 100) : 0;
              const isCritical = pct >= 90;
              const isWarning = pct >= 75 && !isCritical;
              const isLast = index === Math.min(budgets.length, 3) - 1;

              const progressColor = isCritical
                ? colors.danger
                : isWarning
                ? colors.warning
                : colors.primary;

              return (
                <View
                  key={budget.id}
                  style={[styles.budgetItem, !isLast && styles.budgetDivider]}
                >
                  <View style={styles.budgetTopRow}>
                    <Text variant="body" weight="bold" color={colors.text}>
                      {budget.category}
                    </Text>
                    <Text variant="caption" weight="bold" color={progressColor}>
                      {pct}%
                    </Text>
                  </View>

                  <View style={styles.progressBarBackground}>
                    <View
                      style={[
                        styles.progressBarFill,
                        { width: `${pct}%`, backgroundColor: progressColor },
                      ]}
                    />
                  </View>

                  <View style={styles.budgetBottomRow}>
                    <Text variant="label" color={colors.secondary}>
                      Terpakai: {formatIDR(used)}
                    </Text>
                    <Text variant="label" color={colors.secondary}>
                      Batas: {formatIDR(limit)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </Card>
        )}

        {/* 7. Target Impian Preview */}
        <View style={styles.sectionHeader}>
          <Text variant="subtitle" weight="bold" color={colors.text}>
            Target Impian
          </Text>
          <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/(tabs)/more')}>
            <Text variant="caption" weight="bold" color={colors.primary}>
              Lihat
            </Text>
          </TouchableOpacity>
        </View>

        {goals.length === 0 ? (
          <Card variant="flat" padding="md" style={styles.sectionCard}>
            <EmptyState
              title="Belum ada target impian"
              description="Buat rencana tabungan untuk impian terbesarmu."
            />
          </Card>
        ) : (
          <Card variant="default" padding="md" style={styles.sectionCard}>
            {goals.slice(0, 3).map((goal, index) => {
              const current = parseDecimal(goal.currentAmount);
              const target = parseDecimal(goal.targetAmount);
              const pct = target > 0 ? Math.min(Math.round((current / target) * 100), 100) : 0;
              const isLast = index === Math.min(goals.length, 3) - 1;

              return (
                <View
                  key={goal.id}
                  style={[styles.goalItem, !isLast && styles.goalDivider]}
                >
                  <View style={styles.goalTopRow}>
                    <View style={styles.goalTitleContainer}>
                      <Text variant="body" weight="bold" color={colors.text} numberOfLines={1}>
                        {goal.name}
                      </Text>
                      <Text variant="label" color={colors.secondary}>
                        {goal.category}
                      </Text>
                    </View>
                    <Text variant="caption" weight="black" color={colors.primary}>
                      {pct}%
                    </Text>
                  </View>

                  <View style={styles.progressBarBackground}>
                    <View
                      style={[
                        styles.progressBarFill,
                        { width: `${pct}%`, backgroundColor: colors.primary },
                      ]}
                    />
                  </View>

                  <View style={styles.goalBottomRow}>
                    <Text variant="label" weight="semibold" color={colors.text}>
                      {formatIDR(current)}
                    </Text>
                    <Text variant="label" color={colors.secondary}>
                      Target: {formatIDR(target)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
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
  headerInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  headerBadge: {
    width: 44,
    height: 44,
    borderRadius: radii.full,
    backgroundColor: colors.softLavender,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCard: {
    marginBottom: spacing.md,
    backgroundColor: colors.white,
  },
  balanceText: {
    marginVertical: spacing.xs,
    fontSize: 28,
    letterSpacing: -0.5,
  },
  incomeExpenseRow: {
    flexDirection: 'row',
    marginTop: spacing.base,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'center',
  },
  statBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIconBadge: {
    width: 34,
    height: 34,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  statContent: {
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: colors.border,
    marginHorizontal: spacing.sm,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.xs,
  },
  quickActionItem: {
    alignItems: 'center',
    flex: 1,
  },
  actionIconBadge: {
    width: 50,
    height: 50,
    borderRadius: radii.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  actionText: {
    fontSize: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionCard: {
    marginBottom: spacing.base,
  },
  walletsHorizontalList: {
    paddingRight: spacing.sm,
    marginBottom: spacing.base,
  },
  walletCardItem: {
    width: 180,
    marginRight: spacing.sm,
    backgroundColor: colors.white,
  },
  walletItemTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  walletIconCircle: {
    width: 32,
    height: 32,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletName: {
    fontSize: 15,
    marginBottom: 2,
  },
  walletBalance: {
    marginTop: spacing.sm,
    fontSize: 16,
  },
  transactionsCard: {
    backgroundColor: colors.white,
    marginBottom: spacing.base,
    borderRadius: radii.xl,
    overflow: 'hidden',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
  },
  transactionBorderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  txIconBadge: {
    width: 38,
    height: 38,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  txDetails: {
    flex: 1,
    marginRight: spacing.sm,
  },
  txAmount: {
    textAlign: 'right',
  },
  budgetItem: {
    paddingVertical: spacing.xs,
  },
  budgetDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.sm,
    marginBottom: spacing.sm,
  },
  budgetTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  progressBarBackground: {
    height: 6,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceSubtle,
    overflow: 'hidden',
    marginVertical: spacing.xxs + 2,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: radii.full,
  },
  budgetBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xxs,
  },
  goalItem: {
    paddingVertical: spacing.xs,
  },
  goalDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.sm,
    marginBottom: spacing.sm,
  },
  goalTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  goalTitleContainer: {
    flex: 1,
    marginRight: spacing.sm,
  },
  goalBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xxs,
  },
});
