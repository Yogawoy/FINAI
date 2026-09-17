import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Plus,
  Search,
  TrendingUp,
  TrendingDown,
  Calendar,
  Wallet as WalletIcon,
  Tag,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
} from 'lucide-react-native';
import { colors, spacing, radii } from '../../constants/theme';
import Text from '../../components/ui/Text';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import useTransactions, { TransactionFilter } from '../../hooks/useTransactions';
import useWallets from '../../hooks/useWallets';
import { ApiClientError } from '../../lib/api-client';
import { formatIDR, formatRelativeDate, formatDate, parseDecimal } from '../../lib/format';
import type {
  Transaction,
  TransactionType,
  CreateTransactionInput,
  UpdateTransactionInput,
  Wallet,
} from '../../types/common';

const FILTERS: { label: string; value: TransactionFilter }[] = [
  { label: 'Semua', value: 'ALL' },
  { label: 'Pemasukan', value: 'INCOME' },
  { label: 'Pengeluaran', value: 'EXPENSE' },
];

const EXPENSE_CATEGORIES = [
  'Makanan',
  'Transportasi',
  'Belanja',
  'Tagihan',
  'Hiburan',
  'Kesehatan',
  'Pendidikan',
  'Lainnya',
];

const INCOME_CATEGORIES = [
  'Gaji',
  'Bonus',
  'Freelance',
  'Investasi',
  'Hadiah',
  'Lainnya',
];

export default function TransactionsScreen() {
  const {
    filteredTransactions,
    isLoading,
    isRefreshing,
    error,
    activeFilter,
    setActiveFilter,
    searchQuery,
    setSearchQuery,
    fetchTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  } = useTransactions();

  const { wallets } = useWallets();

  // State for Modals
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<boolean>(false);

  // Form State
  const [formType, setFormType] = useState<TransactionType>('EXPENSE');
  const [formAmount, setFormAmount] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formCategory, setFormCategory] = useState<string>('Makanan');
  const [formWalletId, setFormWalletId] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Format Amount with Thousand Separator
  const handleAmountChange = (text: string) => {
    const raw = text.replace(/[^0-9]/g, '');
    if (!raw) {
      setFormAmount('');
      return;
    }
    const formatted = raw.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    setFormAmount(formatted);
  };

  // Open Add Transaction Form
  const handleOpenAdd = () => {
    setIsEditing(false);
    setSelectedTx(null);
    setFormType('EXPENSE');
    setFormAmount('');
    setFormDescription('');
    setFormCategory('Makanan');
    // Auto-select if user only has 1 wallet, otherwise require selection
    setFormWalletId(wallets.length === 1 ? wallets[0].id : '');
    setFormError(null);
    setIsFormOpen(true);
  };

  // Open Edit Transaction Form
  const handleOpenEdit = (tx: Transaction) => {
    setIsEditing(true);
    setFormType(tx.type);
    const rawStr = String(Math.round(parseDecimal(tx.amount)));
    const formatted = rawStr.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    setFormAmount(formatted);
    setFormDescription(tx.description);
    setFormCategory(tx.category);
    setFormWalletId(tx.walletId);
    setFormError(null);
    setIsDetailOpen(false);
    setIsFormOpen(true);
  };

  // Step 1: Validate Form before confirmation
  const handleFormNext = () => {
    Keyboard.dismiss();
    const cleanAmount = formAmount.replace(/\./g, '').replace(/,/g, '.');
    const numericAmount = parseFloat(cleanAmount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setFormError('Nominal transaksi harus lebih besar dari 0.');
      return;
    }

    if (!formDescription.trim()) {
      setFormError('Deskripsi transaksi wajib diisi.');
      return;
    }

    if (!formCategory.trim()) {
      setFormError('Kategori wajib dipilih.');
      return;
    }

    if (!formWalletId) {
      setFormError('Pilih dompet yang digunakan untuk transaksi ini.');
      return;
    }

    setFormError(null);
    setIsConfirmOpen(true);
  };

  // Step 2: Final Submit upon user confirmation
  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    setFormError(null);

    const cleanAmount = formAmount.replace(/\./g, '').replace(/,/g, '.');
    const numericAmount = parseFloat(cleanAmount);

    try {
      if (isEditing && selectedTx) {
        const payload: UpdateTransactionInput = {
          walletId: formWalletId,
          type: formType,
          amount: numericAmount,
          category: formCategory.trim(),
          description: formDescription.trim(),
        };
        await updateTransaction(selectedTx.id, payload);
      } else {
        const payload: CreateTransactionInput = {
          walletId: formWalletId,
          type: formType,
          amount: numericAmount,
          category: formCategory.trim(),
          description: formDescription.trim(),
          transactionDate: new Date().toISOString(),
        };
        await createTransaction(payload);
      }

      setIsConfirmOpen(false);
      setIsFormOpen(false);
      setSelectedTx(null);
    } catch (err: unknown) {
      if (err instanceof ApiClientError && (err.status === 408 || err.code === 'NETWORK_ERROR' || err.status === 0)) {
        setFormError('Status transaksi belum dapat dipastikan. Perbarui data terlebih dahulu sebelum mencoba lagi.');
        fetchTransactions(true);
      } else if (err instanceof ApiClientError && err.code === 'INSUFFICIENT_BALANCE') {
        setFormError('Saldo tidak mencukupi untuk transaksi ini.');
      } else if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError('Gagal menyimpan transaksi.');
      }
      setIsConfirmOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Confirmation
  const handleDeleteConfirm = async () => {
    if (!selectedTx) return;
    setIsSubmitting(true);

    try {
      await deleteTransaction(selectedTx.id);
      setIsDeleteConfirmOpen(false);
      setIsDetailOpen(false);
      setSelectedTx(null);
    } catch (err: unknown) {
      if (err instanceof ApiClientError && (err.status === 408 || err.code === 'NETWORK_ERROR' || err.status === 0)) {
        Alert.alert('Kendala Jaringan', 'Status transaksi belum dapat dipastikan. Perbarui data terlebih dahulu sebelum mencoba lagi.');
        fetchTransactions(true);
      } else if (err instanceof Error) {
        Alert.alert('Gagal Menghapus', err.message);
      } else {
        Alert.alert('Gagal Menghapus', 'Gagal menghapus transaksi.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedWallet = wallets.find((w) => w.id === formWalletId);

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => fetchTransactions(true)}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Header with Title & Add Button */}
        <View style={styles.header}>
          <View>
            <Text variant="title" weight="black" color={colors.text}>
              Transaksi
            </Text>
            <Text variant="caption" color={colors.secondary}>
              Riwayat arus kas masuk dan keluar
            </Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleOpenAdd}
            style={styles.addButton}
          >
            <Plus size={20} color={colors.white} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchWrapper}>
          <Search size={18} color={colors.secondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari transaksi atau kategori..."
            placeholderTextColor={colors.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={16} color={colors.secondary} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Filter Pills */}
        <View style={styles.filterRow}>
          {FILTERS.map((f) => {
            const isActive = activeFilter === f.value;
            return (
              <TouchableOpacity
                key={f.value}
                activeOpacity={0.8}
                onPress={() => setActiveFilter(f.value)}
                style={[styles.filterPill, isActive && styles.filterPillActive]}
              >
                <Text
                  variant="caption"
                  weight={isActive ? 'bold' : 'medium'}
                  color={isActive ? colors.white : colors.secondary}
                >
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Transaction Content */}
        {isLoading && !isRefreshing ? (
          <Card variant="default" padding="lg" style={styles.centerCard}>
            <LoadingState message="Memuat daftar transaksi..." />
          </Card>
        ) : error && filteredTransactions.length === 0 ? (
          <Card variant="default" padding="lg" style={styles.centerCard}>
            <ErrorState
              title="Gagal memuat transaksi"
              message={error}
              retryLabel="Coba Lagi"
              onRetry={() => fetchTransactions(false)}
            />
          </Card>
        ) : filteredTransactions.length === 0 ? (
          <Card variant="default" padding="lg" style={styles.centerCard}>
            <EmptyState
              title="Belum ada transaksi"
              description={
                searchQuery
                  ? 'Tidak ada transaksi yang cocok dengan pencarian Anda.'
                  : 'Catat pemasukan atau pengeluaran pertamamu untuk mulai memantau arus kas.'
              }
              actionLabel="Tambah Transaksi"
              onAction={handleOpenAdd}
            />
          </Card>
        ) : (
          <Card variant="default" padding="none" style={styles.listCard}>
            {filteredTransactions.map((tx, index) => {
              const isIncome = tx.type === 'INCOME';
              const isLast = index === filteredTransactions.length - 1;
              return (
                <TouchableOpacity
                  key={tx.id}
                  activeOpacity={0.7}
                  onPress={() => {
                    setSelectedTx(tx);
                    setIsDetailOpen(true);
                  }}
                  style={[
                    styles.txItem,
                    !isLast && styles.txBorderBottom,
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

                  <View style={styles.txMainInfo}>
                    <Text variant="body" weight="semibold" color={colors.text} numberOfLines={1}>
                      {tx.description}
                    </Text>
                    <Text variant="label" color={colors.secondary} numberOfLines={1}>
                      {tx.category} • {tx.wallet?.name || 'Dompet'} • {formatRelativeDate(tx.transactionDate)}
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
                </TouchableOpacity>
              );
            })}
          </Card>
        )}
      </ScrollView>

      {/* =================================================== */}
      {/* 1. TRANSACTION DETAIL MODAL                         */}
      {/* =================================================== */}
      <Modal
        visible={isDetailOpen && selectedTx !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setIsDetailOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <Card variant="default" padding="lg" style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text variant="subtitle" weight="bold" color={colors.text}>
                Detail Transaksi
              </Text>
              <TouchableOpacity onPress={() => setIsDetailOpen(false)}>
                <X size={20} color={colors.secondary} />
              </TouchableOpacity>
            </View>

            {selectedTx ? (
              <View style={styles.detailBody}>
                <View style={styles.detailAmountBanner}>
                  <Text variant="caption" color={colors.secondary} weight="medium">
                    {selectedTx.type === 'INCOME' ? 'Pemasukan' : 'Pengeluaran'}
                  </Text>
                  <Text
                    variant="display"
                    weight="black"
                    color={selectedTx.type === 'INCOME' ? colors.success : colors.danger}
                    style={styles.detailAmountText}
                  >
                    {selectedTx.type === 'INCOME' ? '+ ' : '- '}
                    {formatIDR(selectedTx.amount)}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text variant="label" color={colors.secondary}>
                    Deskripsi
                  </Text>
                  <Text variant="body" weight="semibold" color={colors.text}>
                    {selectedTx.description}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text variant="label" color={colors.secondary}>
                    Kategori
                  </Text>
                  <Text variant="body" weight="semibold" color={colors.text}>
                    {selectedTx.category}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text variant="label" color={colors.secondary}>
                    Dompet
                  </Text>
                  <Text variant="body" weight="semibold" color={colors.text}>
                    {selectedTx.wallet?.name || 'Dompet Utama'}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text variant="label" color={colors.secondary}>
                    Tanggal Transaksi
                  </Text>
                  <Text variant="body" weight="semibold" color={colors.text}>
                    {formatDate(selectedTx.transactionDate)}
                  </Text>
                </View>

                {/* Actions: Edit and Delete */}
                <View style={styles.modalActionsRow}>
                  <Button
                    title="Ubah"
                    variant="outline"
                    size="md"
                    onPress={() => handleOpenEdit(selectedTx)}
                    style={styles.actionBtnHalf}
                  />
                  <Button
                    title="Hapus"
                    variant="soft"
                    size="md"
                    onPress={() => setIsDeleteConfirmOpen(true)}
                    style={styles.actionBtnHalf}
                  />
                </View>
              </View>
            ) : null}
          </Card>
        </View>
      </Modal>

      {/* =================================================== */}
      {/* 2. ADD / EDIT TRANSACTION MODAL                     */}
      {/* =================================================== */}
      <Modal
        visible={isFormOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsFormOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalBackdrop}
        >
          <Card variant="default" padding="lg" style={styles.formModalCard}>
            <View style={styles.modalHeader}>
              <Text variant="subtitle" weight="bold" color={colors.text}>
                {isEditing ? 'Ubah Transaksi' : 'Catat Transaksi Baru'}
              </Text>
              <TouchableOpacity onPress={() => setIsFormOpen(false)}>
                <X size={20} color={colors.secondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Type Switcher */}
              <View style={styles.typeSwitcher}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    setFormType('EXPENSE');
                    setFormCategory('Makanan');
                  }}
                  style={[
                    styles.typeTab,
                    formType === 'EXPENSE' && styles.typeTabExpense,
                  ]}
                >
                  <Text
                    variant="caption"
                    weight="bold"
                    color={formType === 'EXPENSE' ? colors.white : colors.secondary}
                  >
                    Pengeluaran
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    setFormType('INCOME');
                    setFormCategory('Gaji');
                  }}
                  style={[
                    styles.typeTab,
                    formType === 'INCOME' && styles.typeTabIncome,
                  ]}
                >
                  <Text
                    variant="caption"
                    weight="bold"
                    color={formType === 'INCOME' ? colors.white : colors.secondary}
                  >
                    Pemasukan
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Form Error Banner */}
              {formError ? (
                <View style={styles.formErrorBox}>
                  <AlertCircle size={16} color={colors.danger} />
                  <Text variant="caption" color={colors.danger} style={styles.errorText}>
                    {formError}
                  </Text>
                </View>
              ) : null}

              {/* Amount Input */}
              <View style={styles.inputGroup}>
                <Text variant="label" weight="semibold" color={colors.secondary}>
                  Nominal (Rp)
                </Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.inputField}
                    placeholder="Contoh: 50000"
                    placeholderTextColor={colors.muted}
                    keyboardType="numeric"
                    value={formAmount}
                    onChangeText={handleAmountChange}
                  />
                </View>
              </View>

              {/* Description Input */}
              <View style={styles.inputGroup}>
                <Text variant="label" weight="semibold" color={colors.secondary}>
                  Deskripsi Transaksi
                </Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.inputField}
                    placeholder="Contoh: Makan siang nasi padang"
                    placeholderTextColor={colors.muted}
                    value={formDescription}
                    onChangeText={setFormDescription}
                  />
                </View>
              </View>

              {/* Category Pills */}
              <View style={styles.inputGroup}>
                <Text variant="label" weight="semibold" color={colors.secondary}>
                  Kategori
                </Text>
                <View style={styles.categoryPillsContainer}>
                  {(formType === 'EXPENSE' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map((cat) => {
                    const isSelected = formCategory === cat;
                    return (
                      <TouchableOpacity
                        key={cat}
                        activeOpacity={0.8}
                        onPress={() => setFormCategory(cat)}
                        style={[
                          styles.categoryPill,
                          isSelected && styles.categoryPillSelected,
                        ]}
                      >
                        <Text
                          variant="label"
                          weight={isSelected ? 'bold' : 'medium'}
                          color={isSelected ? colors.white : colors.text}
                        >
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Wallet Selector */}
              <View style={styles.inputGroup}>
                <Text variant="label" weight="semibold" color={colors.secondary}>
                  Pilih Dompet
                </Text>
                {wallets.length === 0 ? (
                  <Text variant="caption" color={colors.danger}>
                    Belum ada dompet. Silakan buat dompet terlebih dahulu di menu Lainnya.
                  </Text>
                ) : (
                  <View style={styles.walletPickerContainer}>
                    {wallets.map((w) => {
                      const isSelected = formWalletId === w.id;
                      return (
                        <TouchableOpacity
                          key={w.id}
                          activeOpacity={0.8}
                          onPress={() => setFormWalletId(w.id)}
                          style={[
                            styles.walletOption,
                            isSelected && styles.walletOptionSelected,
                          ]}
                        >
                          <View style={styles.walletOptionLeft}>
                            <WalletIcon
                              size={16}
                              color={isSelected ? colors.primary : colors.secondary}
                            />
                            <Text
                              variant="caption"
                              weight={isSelected ? 'bold' : 'medium'}
                              color={colors.text}
                              style={styles.walletOptionName}
                            >
                              {w.name}
                            </Text>
                          </View>
                          <Text variant="label" color={colors.secondary}>
                            {formatIDR(w.balance)}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>

              {/* Submit Button to trigger confirmation */}
              <Button
                title={isEditing ? 'Tinjau Perubahan' : 'Lanjut ke Konfirmasi'}
                size="lg"
                onPress={handleFormNext}
                style={styles.submitBtn}
              />
            </ScrollView>
          </Card>
        </KeyboardAvoidingView>
      </Modal>

      {/* =================================================== */}
      {/* 3. TRANSACTION MUTATION CONFIRMATION MODAL          */}
      {/* =================================================== */}
      <Modal
        visible={isConfirmOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsConfirmOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <Card variant="default" padding="lg" style={styles.modalCard}>
            <View style={styles.confirmHeader}>
              <CheckCircle2 size={32} color={colors.primary} />
              <Text variant="subtitle" weight="bold" color={colors.text} style={styles.confirmTitle}>
                Konfirmasi Transaksi
              </Text>
              <Text variant="caption" color={colors.secondary} align="center">
                Pastikan data transaksi sudah sesuai sebelum disimpan ke sistem.
              </Text>
            </View>

            <View style={styles.confirmCardBox}>
              <View style={styles.confirmRow}>
                <Text variant="label" color={colors.secondary}>
                  Tipe
                </Text>
                <Text
                  variant="caption"
                  weight="bold"
                  color={formType === 'INCOME' ? colors.success : colors.danger}
                >
                  {formType === 'INCOME' ? 'Pemasukan' : 'Pengeluaran'}
                </Text>
              </View>

              <View style={styles.confirmRow}>
                <Text variant="label" color={colors.secondary}>
                  Nominal
                </Text>
                <Text variant="body" weight="black" color={colors.text}>
                  {formatIDR(formAmount)}
                </Text>
              </View>

              <View style={styles.confirmRow}>
                <Text variant="label" color={colors.secondary}>
                  Deskripsi
                </Text>
                <Text variant="body" weight="semibold" color={colors.text}>
                  {formDescription}
                </Text>
              </View>

              <View style={styles.confirmRow}>
                <Text variant="label" color={colors.secondary}>
                  Kategori
                </Text>
                <Text variant="caption" weight="medium" color={colors.text}>
                  {formCategory}
                </Text>
              </View>

              <View style={styles.confirmRow}>
                <Text variant="label" color={colors.secondary}>
                  Dompet Terpilih
                </Text>
                <Text variant="caption" weight="medium" color={colors.text}>
                  {selectedWallet?.name || 'Dompet Utama'}
                </Text>
              </View>
            </View>

            <View style={styles.modalActionsRow}>
              <Button
                title="Batal"
                variant="outline"
                size="md"
                onPress={() => setIsConfirmOpen(false)}
                disabled={isSubmitting}
                style={styles.actionBtnHalf}
              />
              <Button
                title={isSubmitting ? 'Menyimpan...' : 'Konfirmasi'}
                size="md"
                loading={isSubmitting}
                onPress={handleConfirmSubmit}
                style={styles.actionBtnHalf}
              />
            </View>
          </Card>
        </View>
      </Modal>

      {/* =================================================== */}
      {/* 4. DELETE TRANSACTION CONFIRMATION MODAL            */}
      {/* =================================================== */}
      <Modal
        visible={isDeleteConfirmOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsDeleteConfirmOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <Card variant="default" padding="lg" style={styles.modalCard}>
            <View style={styles.confirmHeader}>
              <Trash2 size={32} color={colors.danger} />
              <Text variant="subtitle" weight="bold" color={colors.text} style={styles.confirmTitle}>
                Hapus transaksi ini?
              </Text>
              <Text variant="caption" color={colors.secondary} align="center">
                Saldo akan disesuaikan oleh sistem.
              </Text>
            </View>

            <View style={styles.modalActionsRow}>
              <Button
                title="Batal"
                variant="outline"
                size="md"
                onPress={() => setIsDeleteConfirmOpen(false)}
                disabled={isSubmitting}
                style={styles.actionBtnHalf}
              />
              <Button
                title={isSubmitting ? 'Menghapus...' : 'Hapus'}
                variant="soft"
                size="md"
                loading={isSubmitting}
                onPress={handleDeleteConfirm}
                style={styles.actionBtnHalf}
              />
            </View>
          </Card>
        </View>
      </Modal>
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
  addButton: {
    width: 44,
    height: 44,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.base,
    paddingHorizontal: spacing.md,
    height: 44,
    marginBottom: spacing.md,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: spacing.base,
  },
  filterPill: {
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceSubtle,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  centerCard: {
    minHeight: 280,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listCard: {
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    overflow: 'hidden',
    marginBottom: spacing.xl,
  },
  txItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
  },
  txBorderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  txIconBadge: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  txMainInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  txAmount: {
    textAlign: 'right',
  },

  // Modal Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(36, 38, 54, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.base,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: colors.white,
    borderRadius: radii.xxl,
  },
  formModalCard: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '90%',
    backgroundColor: colors.white,
    borderRadius: radii.xxl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailBody: {
    marginTop: spacing.xs,
  },
  detailAmountBanner: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.lg,
    marginBottom: spacing.md,
  },
  detailAmountText: {
    fontSize: 26,
    marginTop: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceSubtle,
  },
  modalActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
  },
  actionBtnHalf: {
    flex: 1,
    marginHorizontal: 4,
  },

  // Form Styles
  typeSwitcher: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.base,
    padding: 3,
    marginBottom: spacing.md,
  },
  typeTab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: radii.md,
  },
  typeTabExpense: {
    backgroundColor: colors.danger,
  },
  typeTabIncome: {
    backgroundColor: colors.success,
  },
  formErrorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dangerLight,
    padding: spacing.sm,
    borderRadius: radii.md,
    marginBottom: spacing.md,
  },
  errorText: {
    marginLeft: spacing.xs,
    flex: 1,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputWrapper: {
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.base,
    paddingHorizontal: spacing.md,
    height: 48,
    marginTop: spacing.xs,
    justifyContent: 'center',
  },
  inputField: {
    fontSize: 14,
    color: colors.text,
  },
  categoryPillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.xs,
  },
  categoryPill: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  categoryPillSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  walletPickerContainer: {
    marginTop: spacing.xs,
  },
  walletOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.base,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xs,
    backgroundColor: colors.surfaceSubtle,
  },
  walletOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.softLavender,
  },
  walletOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  walletOptionName: {
    marginLeft: spacing.sm,
  },
  submitBtn: {
    marginTop: spacing.sm,
    marginBottom: spacing.base,
  },

  // Confirmation Styles
  confirmHeader: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  confirmTitle: {
    marginTop: spacing.xs,
    marginBottom: spacing.xxs,
  },
  confirmCardBox: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  confirmRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
});
