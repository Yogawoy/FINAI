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
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Plus,
  Landmark,
  Smartphone,
  Banknote,
  Wallet as WalletIcon,
  Trash2,
  Edit2,
  X,
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react-native';
import { colors, spacing, radii } from '../constants/theme';
import Text from '../components/ui/Text';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingState from '../components/ui/LoadingState';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import useWallets from '../hooks/useWallets';
import { formatIDR, parseDecimal } from '../lib/format';
import type {
  Wallet,
  WalletType,
  CreateWalletInput,
  UpdateWalletInput,
} from '../types/common';
import { ApiClientError } from '../lib/api-client';

const WALLET_TYPES: { label: string; value: WalletType }[] = [
  { label: 'Bank', value: 'BANK' },
  { label: 'E-Wallet', value: 'E_WALLET' },
  { label: 'Tunai', value: 'CASH' },
];

function getWalletIconComponent(type: WalletType) {
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

export default function WalletsScreen() {
  const router = useRouter();
  const {
    wallets,
    isLoading,
    isRefreshing,
    error,
    fetchWallets,
    createWallet,
    updateWallet,
    deleteWallet,
  } = useWallets();

  // Modals & Sheets
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<boolean>(false);

  // Form Fields
  const [formName, setFormName] = useState<string>('');
  const [formType, setFormType] = useState<WalletType>('BANK');
  const [formBalance, setFormBalance] = useState<string>('0');
  const [formInstitution, setFormInstitution] = useState<string>('');
  const [formAccountLast4, setFormAccountLast4] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(null);

  // Open Add Wallet Form
  const handleOpenAdd = () => {
    setIsEditing(false);
    setSelectedWallet(null);
    setFormName('');
    setFormType('BANK');
    setFormBalance('0');
    setFormInstitution('');
    setFormAccountLast4('');
    setFormError(null);
    setIsFormOpen(true);
  };

  // Format Balance with Thousand Separator
  const handleBalanceChange = (text: string) => {
    const raw = text.replace(/[^0-9]/g, '');
    if (!raw) {
      setFormBalance('0');
      return;
    }
    const formatted = raw.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    setFormBalance(formatted);
  };

  // Open Edit Wallet Form
  const handleOpenEdit = (w: Wallet) => {
    setIsEditing(true);
    setFormName(w.name);
    setFormType(w.type);
    setFormInstitution(w.institution || '');
    setFormAccountLast4(w.accountLast4 || '');
    setFormError(null);
    setIsDetailOpen(false);
    setIsFormOpen(true);
  };

  // Step 1: Validate Form
  const handleFormNext = () => {
    Keyboard.dismiss();
    if (!formName.trim() || formName.trim().length < 2) {
      setFormError('Nama dompet minimal terdiri dari 2 karakter.');
      return;
    }

    if (!isEditing) {
      const cleanBalance = formBalance.replace(/\./g, '').replace(/,/g, '.');
      const numericBalance = parseFloat(cleanBalance);
      if (isNaN(numericBalance) || numericBalance < 0) {
        setFormError('Saldo awal tidak boleh bernilai negatif.');
        return;
      }
    }

    setFormError(null);
    setIsConfirmOpen(true);
  };

  // Step 2: Confirm Submit
  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    setFormError(null);

    try {
      if (isEditing && selectedWallet) {
        // STRICT: DO NOT send balance in update!
        const payload: UpdateWalletInput = {
          name: formName.trim(),
          type: formType,
          institution: formInstitution.trim() || null,
          accountLast4: formAccountLast4.trim() || null,
        };
        await updateWallet(selectedWallet.id, payload);
      } else {
        const cleanBalance = formBalance.replace(/\./g, '').replace(/,/g, '.');
        const numericBalance = parseFloat(cleanBalance) || 0;
        const payload: CreateWalletInput = {
          name: formName.trim(),
          type: formType,
          balance: numericBalance,
          institution: formInstitution.trim() || null,
          accountLast4: formAccountLast4.trim() || null,
        };
        await createWallet(payload);
      }

      setIsConfirmOpen(false);
      setIsFormOpen(false);
      setSelectedWallet(null);
    } catch (err: unknown) {
      if (err instanceof ApiClientError && (err.status === 408 || err.code === 'NETWORK_ERROR' || err.status === 0)) {
        setFormError('Status dompet belum dapat dipastikan. Perbarui data terlebih dahulu sebelum mencoba lagi.');
        fetchWallets(true);
      } else if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError('Gagal menyimpan data dompet.');
      }
      setIsConfirmOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Wallet with 409 WALLET_IN_USE safety
  const handleDeleteWallet = async () => {
    if (!selectedWallet) return;
    setIsSubmitting(true);
    setDeleteErrorMessage(null);

    try {
      await deleteWallet(selectedWallet.id);
      setIsDeleteConfirmOpen(false);
      setIsDetailOpen(false);
      setSelectedWallet(null);
    } catch (err: unknown) {
      if (err instanceof ApiClientError && (err.status === 409 || err.code === 'WALLET_IN_USE')) {
        setDeleteErrorMessage(
          'Dompet tidak dapat dihapus karena masih memiliki riwayat transaksi atau alokasi target keuangan.'
        );
      } else if (err instanceof ApiClientError && (err.status === 408 || err.code === 'NETWORK_ERROR' || err.status === 0)) {
        setDeleteErrorMessage(
          'Status penghapusan belum dapat dipastikan. Perbarui data terlebih dahulu sebelum mencoba lagi.'
        );
      } else if (err instanceof Error) {
        setDeleteErrorMessage(err.message);
      } else {
        setDeleteErrorMessage('Terjadi kendala saat menghapus dompet.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.topNav}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={20} color={colors.text} />
        </TouchableOpacity>
        <Text variant="subtitle" weight="black" color={colors.text} style={styles.navTitle}>
          Kelola Dompet
        </Text>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleOpenAdd}
          style={styles.addNavBtn}
        >
          <Plus size={20} color={colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => fetchWallets(true)}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {isLoading && !isRefreshing ? (
          <View style={styles.centerContainer}>
            <LoadingState message="Memuat data dompet..." />
          </View>
        ) : error && wallets.length === 0 ? (
          <View style={styles.centerContainer}>
            <ErrorState
              title="Gagal memuat dompet"
              message={error}
              retryLabel="Coba Lagi"
              onRetry={() => fetchWallets(false)}
            />
          </View>
        ) : wallets.length === 0 ? (
          <Card variant="default" padding="lg" style={styles.emptyCard}>
            <EmptyState
              title="Belum ada dompet"
              description="Hubungkan rekening bank, e-wallet, atau catat uang tunai pertamamu."
              actionLabel="Tambah Dompet"
              onAction={handleOpenAdd}
            />
          </Card>
        ) : (
          <View style={styles.walletsList}>
            {wallets.map((w) => {
              const IconComp = getWalletIconComponent(w.type);
              const typeLabel =
                w.type === 'BANK' ? 'Bank' : w.type === 'E_WALLET' ? 'E-Wallet' : 'Tunai';

              return (
                <TouchableOpacity
                  key={w.id}
                  activeOpacity={0.7}
                  onPress={() => {
                    setSelectedWallet(w);
                    setDeleteErrorMessage(null);
                    setIsDetailOpen(true);
                  }}
                  style={styles.walletCardWrapper}
                >
                  <Card variant="default" padding="md" style={styles.walletCard}>
                    <View style={styles.walletCardTop}>
                      <View style={styles.walletIconBadge}>
                        <IconComp size={20} color={colors.primary} />
                      </View>
                      <View style={styles.typeBadge}>
                        <Text variant="label" weight="semibold" color={colors.secondary}>
                          {typeLabel}
                        </Text>
                      </View>
                    </View>

                    <Text variant="body" weight="bold" color={colors.text} style={styles.walletCardName}>
                      {w.name}
                    </Text>

                    <Text variant="caption" color={colors.secondary}>
                      {w.institution || (w.accountLast4 ? `•••• ${w.accountLast4}` : 'Dompet Pribadi')}
                    </Text>

                    <View style={styles.walletCardFooter}>
                      <Text variant="label" color={colors.secondary}>
                        Saldo
                      </Text>
                      <Text variant="subtitle" weight="black" color={colors.text}>
                        {formatIDR(w.balance)}
                      </Text>
                    </View>
                  </Card>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* =================================================== */}
      {/* 1. WALLET DETAIL MODAL                              */}
      {/* =================================================== */}
      <Modal
        visible={isDetailOpen && selectedWallet !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setIsDetailOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <Card variant="default" padding="lg" style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text variant="subtitle" weight="bold" color={colors.text}>
                Detail Dompet
              </Text>
              <TouchableOpacity onPress={() => setIsDetailOpen(false)}>
                <X size={20} color={colors.secondary} />
              </TouchableOpacity>
            </View>

            {selectedWallet ? (
              <View style={styles.detailBody}>
                <View style={styles.detailAmountBanner}>
                  <Text variant="caption" color={colors.secondary} weight="medium">
                    Saldo Saat Ini
                  </Text>
                  <Text variant="display" weight="black" color={colors.text} style={styles.detailAmountText}>
                    {formatIDR(selectedWallet.balance)}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text variant="label" color={colors.secondary}>
                    Nama Dompet
                  </Text>
                  <Text variant="body" weight="semibold" color={colors.text}>
                    {selectedWallet.name}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text variant="label" color={colors.secondary}>
                    Tipe
                  </Text>
                  <Text variant="body" weight="semibold" color={colors.text}>
                    {selectedWallet.type === 'BANK'
                      ? 'Bank'
                      : selectedWallet.type === 'E_WALLET'
                      ? 'E-Wallet'
                      : 'Tunai'}
                  </Text>
                </View>

                {selectedWallet.institution ? (
                  <View style={styles.detailRow}>
                    <Text variant="label" color={colors.secondary}>
                      Institusi / Bank
                    </Text>
                    <Text variant="body" weight="semibold" color={colors.text}>
                      {selectedWallet.institution}
                    </Text>
                  </View>
                ) : null}

                {selectedWallet.accountLast4 ? (
                  <View style={styles.detailRow}>
                    <Text variant="label" color={colors.secondary}>
                      Digit Rekening
                    </Text>
                    <Text variant="body" weight="semibold" color={colors.text}>
                      •••• {selectedWallet.accountLast4}
                    </Text>
                  </View>
                ) : null}

                {/* Actions */}
                <View style={styles.modalActionsRow}>
                  <Button
                    title="Ubah Dompet"
                    variant="outline"
                    size="md"
                    onPress={() => handleOpenEdit(selectedWallet)}
                    style={styles.actionBtnHalf}
                  />
                  <Button
                    title="Hapus"
                    variant="soft"
                    size="md"
                    onPress={() => {
                      setDeleteErrorMessage(null);
                      setIsDeleteConfirmOpen(true);
                    }}
                    style={styles.actionBtnHalf}
                  />
                </View>
              </View>
            ) : null}
          </Card>
        </View>
      </Modal>

      {/* =================================================== */}
      {/* 2. ADD / EDIT WALLET FORM MODAL                     */}
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
                {isEditing ? 'Ubah Dompet' : 'Tambah Dompet Baru'}
              </Text>
              <TouchableOpacity onPress={() => setIsFormOpen(false)}>
                <X size={20} color={colors.secondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Type Switcher */}
              <View style={styles.typeSwitcher}>
                {WALLET_TYPES.map((t) => {
                  const isSelected = formType === t.value;
                  return (
                    <TouchableOpacity
                      key={t.value}
                      activeOpacity={0.8}
                      onPress={() => setFormType(t.value)}
                      style={[styles.typeTab, isSelected && styles.typeTabSelected]}
                    >
                      <Text
                        variant="caption"
                        weight={isSelected ? 'bold' : 'medium'}
                        color={isSelected ? colors.white : colors.secondary}
                      >
                        {t.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {formError ? (
                <View style={styles.formErrorBox}>
                  <AlertCircle size={16} color={colors.danger} />
                  <Text variant="caption" color={colors.danger} style={styles.errorText}>
                    {formError}
                  </Text>
                </View>
              ) : null}

              {/* Name Input */}
              <View style={styles.inputGroup}>
                <Text variant="label" weight="semibold" color={colors.secondary}>
                  Nama Dompet
                </Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.inputField}
                    placeholder="Contoh: BCA Utama, GoPay, Dompet Saku"
                    placeholderTextColor={colors.muted}
                    value={formName}
                    onChangeText={setFormName}
                  />
                </View>
              </View>

              {/* Initial Balance (Add Mode Only) */}
              {!isEditing ? (
                <View style={styles.inputGroup}>
                  <Text variant="label" weight="semibold" color={colors.secondary}>
                    Saldo Awal (Rp)
                  </Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.inputField}
                      placeholder="0"
                      placeholderTextColor={colors.muted}
                      keyboardType="numeric"
                      value={formBalance}
                      onChangeText={handleBalanceChange}
                    />
                  </View>
                </View>
              ) : null}

              {/* Institution Input */}
              <View style={styles.inputGroup}>
                <Text variant="label" weight="semibold" color={colors.secondary}>
                  Institusi / Penyedia (Opsional)
                </Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.inputField}
                    placeholder="Contoh: Bank Central Asia, Gojek"
                    placeholderTextColor={colors.muted}
                    value={formInstitution}
                    onChangeText={setFormInstitution}
                  />
                </View>
              </View>

              {/* Account Last 4 Input */}
              <View style={styles.inputGroup}>
                <Text variant="label" weight="semibold" color={colors.secondary}>
                  4 Digit Terakhir Rekening (Opsional)
                </Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.inputField}
                    placeholder="Contoh: 4821"
                    placeholderTextColor={colors.muted}
                    keyboardType="numeric"
                    maxLength={10}
                    value={formAccountLast4}
                    onChangeText={setFormAccountLast4}
                  />
                </View>
              </View>

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
      {/* 3. ADD / EDIT WALLET CONFIRMATION MODAL             */}
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
                {isEditing ? 'Konfirmasi Perubahan' : 'Konfirmasi Dompet Baru'}
              </Text>
              <Text variant="caption" color={colors.secondary} align="center">
                Tinjau kembali data dompet sebelum disimpan ke server.
              </Text>
            </View>

            <View style={styles.confirmCardBox}>
              <View style={styles.confirmRow}>
                <Text variant="label" color={colors.secondary}>
                  Nama Dompet
                </Text>
                <Text variant="body" weight="bold" color={colors.text}>
                  {formName}
                </Text>
              </View>

              <View style={styles.confirmRow}>
                <Text variant="label" color={colors.secondary}>
                  Tipe
                </Text>
                <Text variant="caption" weight="semibold" color={colors.text}>
                  {formType === 'BANK' ? 'Bank' : formType === 'E_WALLET' ? 'E-Wallet' : 'Tunai'}
                </Text>
              </View>

              {!isEditing ? (
                <View style={styles.confirmRow}>
                  <Text variant="label" color={colors.secondary}>
                    Saldo Awal
                  </Text>
                  <Text variant="body" weight="black" color={colors.text}>
                    {formatIDR(formBalance)}
                  </Text>
                </View>
              ) : null}

              {formInstitution ? (
                <View style={styles.confirmRow}>
                  <Text variant="label" color={colors.secondary}>
                    Institusi
                  </Text>
                  <Text variant="caption" color={colors.text}>
                    {formInstitution}
                  </Text>
                </View>
              ) : null}
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
                title={isSubmitting ? 'Menyimpan...' : 'Simpan'}
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
      {/* 4. DELETE WALLET CONFIRMATION (409 SAFETY)          */}
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
                Hapus Dompet?
              </Text>
              <Text variant="caption" color={colors.secondary} align="center">
                Apakah Anda yakin ingin menghapus dompet "{selectedWallet?.name}"?
              </Text>
            </View>

            {deleteErrorMessage ? (
              <View style={styles.deleteErrorAlert}>
                <ShieldAlert size={18} color={colors.danger} />
                <Text variant="caption" weight="medium" color={colors.danger} style={styles.errorText}>
                  {deleteErrorMessage}
                </Text>
              </View>
            ) : null}

            <View style={styles.modalActionsRow}>
              <Button
                title="Batal"
                variant="outline"
                size="md"
                onPress={() => {
                  setIsDeleteConfirmOpen(false);
                  setDeleteErrorMessage(null);
                }}
                disabled={isSubmitting}
                style={styles.actionBtnHalf}
              />
              <Button
                title={isSubmitting ? 'Menghapus...' : 'Hapus'}
                variant="soft"
                size="md"
                loading={isSubmitting}
                onPress={handleDeleteWallet}
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
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    fontSize: 18,
  },
  addNavBtn: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  scrollContent: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  centerContainer: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCard: {
    minHeight: 280,
    justifyContent: 'center',
  },
  walletsList: {
    marginTop: spacing.xs,
  },
  walletCardWrapper: {
    marginBottom: spacing.md,
  },
  walletCard: {
    backgroundColor: colors.white,
    borderRadius: radii.xl,
  },
  walletCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  walletIconBadge: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeBadge: {
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radii.full,
  },
  walletCardName: {
    fontSize: 18,
    marginBottom: 2,
  },
  walletCardFooter: {
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
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
  typeTabSelected: {
    backgroundColor: colors.primary,
  },
  formErrorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dangerLight,
    padding: spacing.sm,
    borderRadius: radii.md,
    marginBottom: spacing.md,
  },
  deleteErrorAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dangerLight,
    padding: spacing.md,
    borderRadius: radii.md,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
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
