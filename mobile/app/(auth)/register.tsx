import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Sparkles, ShieldCheck, User, Mail, Lock } from 'lucide-react-native';
import { colors, spacing, radii } from '../../constants/theme';
import Text from '../../components/ui/Text';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import useAuth from '../../hooks/useAuth';
import { mapErrorMessage } from '../../lib/api-client';

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password) {
      setErrorMessage('Harap lengkapi semua data pendaftaran.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Kata sandi minimal terdiri dari 6 karakter.');
      return;
    }

    setErrorMessage(null);
    try {
      const success = await register({
        name: name.trim(),
        email: email.trim(),
        password,
      });
      if (success) {
        router.replace('/(tabs)');
      } else {
        setErrorMessage('Gagal mendaftar. Email mungkin sudah terdaftar.');
      }
    } catch (err: unknown) {
      setErrorMessage(mapErrorMessage(err));
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoBadge}>
              <Sparkles size={24} color={colors.white} />
            </View>
            <Text variant="title" weight="black" color={colors.text} style={styles.title}>
              FinAI
            </Text>
            <Text variant="caption" color={colors.secondary} style={styles.subtitle}>
              Mulai Perjalanan Finansial Cerdasmu
            </Text>
          </View>

          {/* Segmented Switcher */}
          <View style={styles.switcherContainer}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push('/(auth)/login')}
              style={styles.switcherTab}
            >
              <Text variant="caption" weight="medium" color={colors.secondary}>
                Masuk
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.switcherTab, styles.switcherActive]}
            >
              <Text variant="caption" weight="bold" color={colors.text}>
                Daftar Baru
              </Text>
            </TouchableOpacity>
          </View>

          {/* Main Card Form */}
          <Card padding="lg" style={styles.card}>
            <Text variant="subtitle" weight="bold" color={colors.text} style={styles.cardTitle}>
              Buat Akun Baru
            </Text>
            <Text variant="caption" color={colors.secondary} style={styles.cardSubtitle}>
              Gratis selamanya, tanpa biaya tersembunyi
            </Text>

            {errorMessage ? (
              <View style={styles.errorContainer}>
                <Text variant="caption" color={colors.danger} weight="medium">
                  {errorMessage}
                </Text>
              </View>
            ) : null}

            {/* Input Name */}
            <View style={styles.inputGroup}>
              <Text variant="label" weight="semibold" color={colors.secondary} style={styles.label}>
                Nama Lengkap
              </Text>
              <View style={styles.inputWrapper}>
                <User size={18} color={colors.secondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Contoh: Yoga W."
                  placeholderTextColor={colors.muted}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* Input Email */}
            <View style={styles.inputGroup}>
              <Text variant="label" weight="semibold" color={colors.secondary} style={styles.label}>
                Email
              </Text>
              <View style={styles.inputWrapper}>
                <Mail size={18} color={colors.secondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="nama@email.com"
                  placeholderTextColor={colors.muted}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            {/* Input Password */}
            <View style={styles.inputGroup}>
              <Text variant="label" weight="semibold" color={colors.secondary} style={styles.label}>
                Kata Sandi
              </Text>
              <View style={styles.inputWrapper}>
                <Lock size={18} color={colors.secondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Minimal 6 karakter"
                  placeholderTextColor={colors.muted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Submit Button */}
            <Button
              title="Daftar Sekarang"
              size="lg"
              loading={isLoading}
              onPress={handleRegister}
              style={styles.submitButton}
            />
          </Card>

          {/* Trust Badge Footer */}
          <View style={styles.trustBadge}>
            <ShieldCheck size={16} color={colors.success} />
            <Text variant="caption" color={colors.secondary} weight="medium" style={styles.trustText}>
              Enkripsi Standar Perbankan • Privasi Terlindungi
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.base,
    paddingBottom: spacing.xxl,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  logoBadge: {
    width: 52,
    height: 52,
    borderRadius: radii.xl,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 4,
  },
  title: {
    fontSize: 22,
  },
  subtitle: {
    marginTop: spacing.xxs,
  },
  switcherContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.base,
    padding: spacing.xxs + 2,
    width: '100%',
    maxWidth: 380,
    marginBottom: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
  },
  switcherTab: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
    borderRadius: radii.md,
  },
  switcherActive: {
    backgroundColor: colors.white,
    shadowColor: '#242636',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  card: {
    width: '100%',
    maxWidth: 380,
  },
  cardTitle: {
    marginBottom: spacing.xxs,
  },
  cardSubtitle: {
    marginBottom: spacing.base,
  },
  errorContainer: {
    backgroundColor: colors.dangerLight,
    padding: spacing.sm,
    borderRadius: radii.md,
    marginBottom: spacing.md,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    marginBottom: spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.base,
    paddingHorizontal: spacing.md,
    minHeight: 48,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    minHeight: 48,
  },
  submitButton: {
    marginTop: spacing.sm,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  trustText: {
    marginLeft: spacing.xs,
    fontSize: 11,
  },
});
