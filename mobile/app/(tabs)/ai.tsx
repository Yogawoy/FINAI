import React from 'react';
import { View, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Sparkles, Send, Bot, ShieldCheck } from 'lucide-react-native';
import { colors, spacing, radii } from '../../constants/theme';
import Text from '../../components/ui/Text';
import Card from '../../components/ui/Card';

const SAMPLE_PROMPTS = [
  'Bagaimana kondisi keuanganku bulan ini?',
  'Berapa sisa anggaran makan & jajan?',
  'Saya ingin nabung 15 juta untuk beli laptop',
];

export default function AiScreen() {
  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top Header */}
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Sparkles size={20} color={colors.white} />
          </View>
          <View>
            <Text variant="subtitle" weight="black" color={colors.text}>
              FinAI Assistant
            </Text>
            <Text variant="caption" color={colors.secondary}>
              Mulai percakapan dengan FinAI
            </Text>
          </View>
        </View>

        {/* Chat Area ScrollView */}
        <ScrollView
          style={styles.chatScroll}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Welcome Message Card */}
          <Card variant="accent" padding="lg" style={styles.welcomeCard}>
            <View style={styles.botBadge}>
              <Bot size={22} color={colors.primaryDark} />
            </View>
            <Text variant="body" weight="bold" color={colors.text} style={styles.welcomeTitle}>
              Halo! Saya Asisten Finansial FinAI
            </Text>
            <Text variant="caption" color={colors.secondary} style={styles.welcomeDescription}>
              Saya siap membantumu menganalisis pengeluaran, menyusun rencana tabungan, atau mengevaluasi kesehatan anggaran bulanan.
            </Text>
          </Card>

          {/* Suggested Prompts Section */}
          <View style={styles.suggestedSection}>
            <Text variant="label" weight="bold" color={colors.secondary} style={styles.suggestedHeader}>
              Contoh Pertanyaan
            </Text>
            {SAMPLE_PROMPTS.map((prompt, index) => (
              <TouchableOpacity
                key={index}
                activeOpacity={0.7}
                style={styles.promptCard}
              >
                <Text variant="caption" color={colors.text} weight="medium">
                  {prompt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Privacy Note */}
          <View style={styles.privacyNote}>
            <ShieldCheck size={14} color={colors.secondary} />
            <Text variant="caption" color={colors.secondary} style={styles.privacyText}>
              Konteks keuangan diproses secara aman di sisi server.
            </Text>
          </View>
        </ScrollView>

        {/* Bottom Input Area */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Tanya apa saja tentang keuanganmu..."
              placeholderTextColor={colors.muted}
              editable={false} // Placeholder for Step 1
            />
            <TouchableOpacity activeOpacity={0.8} style={styles.sendButton} disabled>
              <Send size={18} color={colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },
  headerIcon: {
    width: 38,
    height: 38,
    borderRadius: radii.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  chatScroll: {
    flex: 1,
  },
  chatContent: {
    padding: spacing.base,
  },
  welcomeCard: {
    marginBottom: spacing.lg,
  },
  botBadge: {
    width: 44,
    height: 44,
    borderRadius: radii.full,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  welcomeTitle: {
    marginBottom: spacing.xs,
  },
  welcomeDescription: {
    lineHeight: 20,
  },
  suggestedSection: {
    marginBottom: spacing.lg,
  },
  suggestedHeader: {
    marginBottom: spacing.sm,
  },
  promptCard: {
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: radii.base,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  privacyText: {
    marginLeft: spacing.xs,
    fontSize: 11,
  },
  inputContainer: {
    padding: spacing.base,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.base,
    paddingHorizontal: spacing.md,
    minHeight: 48,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    minHeight: 48,
  },
  sendButton: {
    width: 34,
    height: 34,
    borderRadius: radii.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.xs,
    opacity: 0.7,
  },
});
