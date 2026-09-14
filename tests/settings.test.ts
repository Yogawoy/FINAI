import { prisma } from '../src/lib/db';
import { registerUser } from '../src/lib/services/auth.service';
import { SettingsService, SettingsWalletNotFoundError } from '../src/lib/services/settings.service';
import { WalletService } from '../src/lib/services/wallet.service';
import { serializeSettings } from '../src/lib/serializers/settings';
import { UpdateSettingsSchema } from '../src/lib/validations/settings';
import { UpdateProfileSchema } from '../src/lib/validations/auth';

async function runTests() {
  console.log('🧪 Starting FinAI Settings & Profile Test Suite...\n');
  let passedCount = 0;
  let failedCount = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✅ PASSED: ${testName}`);
      passedCount++;
    } else {
      console.error(`  ❌ FAILED: ${testName}`);
      failedCount++;
    }
  }

  // Cleanup test users before testing
  const emailA = 'settings_test_user_a@finai.local';
  const emailB = 'settings_test_user_b@finai.local';

  await prisma.wallet.deleteMany({
    where: { user: { email: { in: [emailA, emailB] } } },
  });
  await prisma.userSettings.deleteMany({
    where: { user: { email: { in: [emailA, emailB] } } },
  });
  await prisma.user.deleteMany({
    where: { email: { in: [emailA, emailB] } },
  });

  try {
    // 1. Setup Test Users
    console.log('--- Step 1: User & Wallet Setup ---');
    const regA = await registerUser({ name: 'Settings User A', email: emailA, password: 'password123' });
    const regB = await registerUser({ name: 'Settings User B', email: emailB, password: 'password123' });
    const userA = regA.data!.user;
    const userB = regB.data!.user;

    const walletA = await WalletService.createWallet(userA.id, {
      name: 'Dompet User A',
      type: 'BANK',
      institution: 'BCA',
      balance: 1000000,
    });

    const walletB = await WalletService.createWallet(userB.id, {
      name: 'Dompet User B',
      type: 'E_WALLET',
      institution: 'GoPay',
      balance: 500000,
    });

    assert(Boolean(userA.id && userB.id), 'Test users A & B registered successfully');
    assert(Boolean(walletA.id && walletB.id), 'Test wallets for User A & B created successfully');

    // 2. Test getUserSettings & Defaults
    console.log('\n--- Step 2: Settings Read & Auto-Creation ---');
    const settingsA = await SettingsService.getUserSettings(userA.id);
    assert(settingsA.userId === userA.id, 'getUserSettings returns settings belonging to User A');
    assert(settingsA.language === 'id-ID', 'Default language is id-ID');
    assert(settingsA.currency === 'IDR', 'Default currency is IDR');
    assert(settingsA.budgetReminder === true, 'Default budgetReminder is true');
    assert(settingsA.aiActionConfirmation === true, 'Default aiActionConfirmation is true');

    // 3. Test Serialization
    console.log('\n--- Step 3: Settings Serialization ---');
    const serialized = serializeSettings(settingsA);
    assert(typeof serialized.createdAt === 'string', 'Serialized createdAt is an ISO date string');
    assert(typeof serialized.updatedAt === 'string', 'Serialized updatedAt is an ISO date string');
    assert(serialized.language === 'id-ID', 'Serialized language matches original model');
    assert(!('passwordHash' in serialized), 'Serialized settings contains no sensitive password fields');

    // 4. Test Partial Update (Preferences & Reminders)
    console.log('\n--- Step 4: Partial Update Settings ---');
    const updated1 = await SettingsService.updateUserSettings(userA.id, {
      language: 'en-US',
      currency: 'USD',
      numberFormat: 'en-US',
      budgetReminder: false,
      aiActionConfirmation: false,
    });
    assert(updated1.language === 'en-US', 'Language updated to en-US');
    assert(updated1.currency === 'USD', 'Currency updated to USD');
    assert(updated1.numberFormat === 'en-US', 'Number format updated to en-US');
    assert(updated1.budgetReminder === false, 'budgetReminder toggled to false');
    assert(updated1.aiActionConfirmation === false, 'aiActionConfirmation toggled to false');
    assert(updated1.goalReminder === true, 'Untouched field goalReminder preserved as true');

    // 5. Test Default Wallet Setting with Ownership Check (Anti-IDOR)
    console.log('\n--- Step 5: Default Wallet & Anti-IDOR Security ---');
    // 5a. Setting own wallet should succeed
    const updatedWallet = await SettingsService.updateUserSettings(userA.id, {
      defaultWalletId: walletA.id,
    });
    assert(updatedWallet.defaultWalletId === walletA.id, 'User A can set own wallet as defaultWalletId');

    // 5b. Setting another user's wallet should be rejected
    let idorPrevented = false;
    try {
      await SettingsService.updateUserSettings(userA.id, {
        defaultWalletId: walletB.id, // Belongs to User B!
      });
    } catch (err) {
      if (err instanceof SettingsWalletNotFoundError) {
        idorPrevented = true;
      }
    }
    assert(idorPrevented, 'IDOR prevented: User A cannot set User B wallet as default wallet');

    // 6. Test Validation Schema
    console.log('\n--- Step 6: Input Validation Schema ---');
    const validPayload = UpdateSettingsSchema.safeParse({
      language: 'id-ID',
      currency: 'IDR',
      defaultWalletId: '', // Empty string should be transformed to null
      defaultCategory: '', // Empty string should be transformed to null
      animations: true,
    });
    assert(validPayload.success === true, 'UpdateSettingsSchema accepts valid payload');
    if (validPayload.success) {
      assert(validPayload.data.defaultWalletId === null, 'Empty string defaultWalletId coerced to null');
      assert(validPayload.data.defaultCategory === null, 'Empty string defaultCategory coerced to null');
    }

    const invalidPayload = UpdateSettingsSchema.safeParse({
      language: 12345, // Invalid type
      budgetReminder: 'not_a_boolean', // Invalid type
    });
    assert(invalidPayload.success === false, 'UpdateSettingsSchema rejects invalid types');

    // 7. Test Profile Update (Name change & email protection)
    console.log('\n--- Step 7: Profile Update Validation & DB Persistence ---');
    const validProfile = UpdateProfileSchema.safeParse({ name: 'Yoga Updated Name' });
    assert(validProfile.success === true, 'UpdateProfileSchema accepts valid name');

    const invalidProfile = UpdateProfileSchema.safeParse({ name: 'A' }); // Too short (< 2)
    assert(invalidProfile.success === false, 'UpdateProfileSchema rejects name shorter than 2 chars');

    const updatedUser = await prisma.user.update({
      where: { id: userA.id },
      data: { name: 'Yoga Updated Name' },
      select: { id: true, name: true, email: true },
    });
    assert(updatedUser.name === 'Yoga Updated Name', 'User name successfully updated in database');
    assert(updatedUser.email === emailA, 'User email remains untouched');

    // 8. User Isolation Check
    console.log('\n--- Step 8: User Settings Isolation Check ---');
    const settingsB = await SettingsService.getUserSettings(userB.id);
    assert(settingsB.language === 'id-ID', 'User B settings remained isolated and unchanged');
    assert(settingsB.currency === 'IDR', 'User B currency remained default IDR');

  } catch (error) {
    console.error('Unexpected error in test runner:', error);
    failedCount++;
  } finally {
    // Cleanup
    await prisma.wallet.deleteMany({
      where: { user: { email: { in: [emailA, emailB] } } },
    });
    await prisma.userSettings.deleteMany({
      where: { user: { email: { in: [emailA, emailB] } } },
    });
    await prisma.user.deleteMany({
      where: { email: { in: [emailA, emailB] } },
    });
  }

  console.log(`\n========================================`);
  console.log(`Test Results: ${passedCount} Passed, ${failedCount} Failed`);
  console.log(`========================================\n`);

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTests();
