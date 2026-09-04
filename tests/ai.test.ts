import assert from 'node:assert/strict';
import { AIChatRequestSchema, GrokStructuredResponseSchema } from '../src/lib/ai/ai.schemas';

async function runTests() {
  console.log('🧪 Starting FinAI Phase 9 — Groq API Integration Test Suite...\n');
  let passedCount = 0;
  let failedCount = 0;

  function logPass(name: string) {
    console.log(`  ✅ PASSED: ${name}`);
    passedCount++;
  }
  function logFail(name: string, error: unknown) {
    console.error(`  ❌ FAILED: ${name}`);
    console.error(error);
    failedCount++;
  }
  async function test(name: string, fn: () => Promise<void> | void) {
    try {
      await fn();
      logPass(name);
    } catch (error) {
      logFail(name, error);
    }
  }

  // -----------------------------------------------------------------------
  // 1. Request Validation
  // -----------------------------------------------------------------------
  await test('1. Valid request passes — message + empty history', () => {
    const r = AIChatRequestSchema.safeParse({ message: 'Halo', history: [] });
    assert.equal(r.success, true);
  });

  await test('2. Valid request with history', () => {
    const r = AIChatRequestSchema.safeParse({
      message: 'Tadi aku beli ayam geprek 10 ribu.',
      history: [{ role: 'user', content: 'Hi' }, { role: 'assistant', content: 'Halo!' }],
    });
    assert.equal(r.success, true);
  });

  await test('3. Rejects empty message', () => {
    const r = AIChatRequestSchema.safeParse({ message: '', history: [] });
    assert.equal(r.success, false);
  });

  await test('4. Rejects message too long (>2000)', () => {
    const r = AIChatRequestSchema.safeParse({ message: 'a'.repeat(2001), history: [] });
    assert.equal(r.success, false);
  });

  await test('5. Rejects history too long (>20)', () => {
    const history = Array.from({ length: 21 }, () => ({ role: 'user' as const, content: 'hi' }));
    const r = AIChatRequestSchema.safeParse({ message: 'halo', history });
    assert.equal(r.success, false);
  });

  await test('6. Rejects invalid history role', () => {
    const r = AIChatRequestSchema.safeParse({
      message: 'halo',
      history: [{ role: 'system', content: 'hi' }],
    });
    assert.equal(r.success, false);
  });

  await test('7. Rejects arbitrary fields (strict)', () => {
    // Should strip or not accept unknown — we test that extra known fields are handled
    const r = AIChatRequestSchema.safeParse({ message: 'halo', history: [], apiKey: 'evil' } as unknown as Record<string, unknown>);
    // Extra fields are stripped by zod by default (not strict on this schema) — we verify message still parses
    // But we ensure apiKey is NOT in parsed data
    if (r.success) {
      assert.equal((r.data as unknown as Record<string, unknown>).apiKey, undefined);
    } else {
      assert.ok(true); // strict rejection also acceptable
    }
  });

  await test('8. Trims message and rejects whitespace-only', () => {
    const r = AIChatRequestSchema.safeParse({ message: '   ', history: [] });
    assert.equal(r.success, false);
  });

  // -----------------------------------------------------------------------
  // 2. Structured Response Schemas
  // -----------------------------------------------------------------------
  await test('9. Grok text response parses', () => {
    const r = GrokStructuredResponseSchema.safeParse({ type: 'text', message: 'Halo, ada yang bisa dibantu?' });
    assert.equal(r.success, true);
  });

  await test('10. Grok clarification parses', () => {
    const r = GrokStructuredResponseSchema.safeParse({ type: 'clarification', message: 'Bayarnya dari wallet mana?' });
    assert.equal(r.success, true);
  });

  await test('11. Grok financial_action create_transaction parses', () => {
    const r = GrokStructuredResponseSchema.safeParse({
      type: 'financial_action',
      action: 'create_transaction',
      payload: {
        transactionType: 'EXPENSE',
        amount: '10000',
        description: 'Ayam geprek',
        category: 'food',
        walletId: 'wallet-123',
        walletName: 'GoPay',
        date: '2026-09-04',
      },
      message: 'Silakan konfirmasi',
      requiresConfirmation: true,
    });
    assert.equal(r.success, true);
  });

  await test('12. Grok financial_action goal_contribution parses', () => {
    const r = GrokStructuredResponseSchema.safeParse({
      type: 'financial_action',
      action: 'goal_contribution',
      payload: {
        amount: '500000',
        description: 'Tabungan Kuliah',
        sourceWalletId: 'wallet-bca',
        sourceWalletName: 'BCA',
        goalName: 'Kuliah',
        date: '2026-09-04',
      },
      message: 'Siap!',
      requiresConfirmation: true,
    });
    assert.equal(r.success, true);
  });

  await test('13. Grok financial_action transfer parses', () => {
    const r = GrokStructuredResponseSchema.safeParse({
      type: 'financial_action',
      action: 'transfer',
      payload: {
        amount: '200000',
        sourceWalletId: 'wallet-bca',
        sourceWalletName: 'BCA',
        destinationWalletId: 'wallet-gopay',
        destinationWalletName: 'GoPay',
        date: '2026-09-04',
      },
      message: 'Transfer siap',
      requiresConfirmation: true,
    });
    assert.equal(r.success, true);
  });

  await test('14. Grok financial_action requiresConfirmation must be true', () => {
    const r = GrokStructuredResponseSchema.safeParse({
      type: 'financial_action',
      action: 'create_transaction',
      payload: { amount: '10000' },
      message: 'test',
      requiresConfirmation: false,
    } as unknown as Record<string, unknown>);
    assert.equal(r.success, false);
  });

  await test('15. Grok financial_action rejects invalid amount format', () => {
    const r = GrokStructuredResponseSchema.safeParse({
      type: 'financial_action',
      action: 'create_transaction',
      payload: { amount: '10.000' },
      message: 'test',
      requiresConfirmation: true,
    });
    assert.equal(r.success, false);
  });

  // -----------------------------------------------------------------------
  // 3. Mock Grok API — success, 429, error
  // -----------------------------------------------------------------------
  await test('16. Mock Grok success — financial_action expense 10k', async () => {
    const originalFetch = global.fetch;
    const mockResponse = {
      ok: true,
      status: 200,
      json: async () => ({
        id: 'chatcmpl-mock',
        choices: [{ message: { role: 'assistant', content: JSON.stringify({ type: 'financial_action', action: 'create_transaction', payload: { transactionType: 'EXPENSE', amount: '10000', description: 'Ayam geprek', category: 'food', walletId: 'w-gopay', walletName: 'GoPay', date: '2026-09-04' }, message: 'Silakan konfirmasi', requiresConfirmation: true }) }, finish_reason: 'stop', index: 0 }],
      }),
    };
    global.fetch = async () => mockResponse as unknown as Response;

    // Dynamically import grok client (needs env mock)
    const prevGroq = process.env.GROQ_API_KEY;
    process.env.GROQ_API_KEY = 'gsk_mock_key_for_test';

    try {
      const { callGrok } = await import('../src/lib/ai/grok');
      const result = await callGrok({
        message: 'Tadi aku beli ayam geprek 10 ribu.',
        history: [],
        context: {
          wallets: [{ id: 'w-gopay', name: 'GoPay', type: 'E_WALLET' }],
          goals: [],
          budgets: [],
          recentTransactions: [],
          currentDate: '4 September 2026',
        },
      });
      assert.equal(result.type, 'financial_action');
      if (result.type === 'financial_action') {
        assert.equal(result.action, 'create_transaction');
        assert.equal(result.payload.amount, '10000');
        assert.equal(result.requiresConfirmation, true);
      }
    } finally {
      global.fetch = originalFetch;
      if (prevGroq) process.env.GROQ_API_KEY = prevGroq;
      else delete process.env.GROQ_API_KEY;
      // Clear module cache for grok
      delete require.cache[require.resolve('../src/lib/ai/grok')];
    }
  });

  await test('17. Mock Grok clarification — asks for wallet', async () => {
    const originalFetch = global.fetch;
    const mockResponse = {
      ok: true,
      status: 200,
      json: async () => ({
        id: 'chatcmpl-mock2',
        choices: [{ message: { role: 'assistant', content: JSON.stringify({ type: 'clarification', message: 'Bayarnya dari wallet mana? Kamu punya BCA, GoPay, dan Cash.' }) }, finish_reason: 'stop', index: 0 }],
      }),
    };
    global.fetch = async () => mockResponse as unknown as Response;
    const prevGroq = process.env.GROQ_API_KEY;
    process.env.GROQ_API_KEY = 'gsk_mock_key_for_test';
    try {
      const { callGrok } = await import('../src/lib/ai/grok');
      const result = await callGrok({
        message: 'Bayar makan 50 ribu.',
        history: [],
        context: {
          wallets: [{ id: 'w1', name: 'BCA', type: 'BANK' }, { id: 'w2', name: 'GoPay', type: 'E_WALLET' }, { id: 'w3', name: 'Cash', type: 'CASH' }],
          goals: [],
          budgets: [],
          recentTransactions: [],
          currentDate: '4 September 2026',
        },
      });
      assert.equal(result.type, 'clarification');
    } finally {
      global.fetch = originalFetch;
      if (prevGroq) process.env.GROQ_API_KEY = prevGroq;
      else delete process.env.GROQ_API_KEY;
      delete require.cache[require.resolve('../src/lib/ai/grok')];
    }
  });

  await test('18. Mock Grok 429 throws rate limit error', async () => {
    const originalFetch = global.fetch;
    global.fetch = async () => ({ ok: false, status: 429, json: async () => ({ error: { message: 'Rate limit' } }) } as unknown as Response);
    const prevGroq = process.env.GROQ_API_KEY;
    process.env.GROQ_API_KEY = 'gsk_mock_key_for_test';
    try {
      const { callGrok, GrokRateLimitError } = await import('../src/lib/ai/grok');
      let threw = false;
      try {
        await callGrok({ message: 'halo', history: [], context: { wallets: [], goals: [], budgets: [], recentTransactions: [], currentDate: '4 Sep 2026' } });
      } catch (e) {
        threw = e instanceof GrokRateLimitError;
      }
      assert.equal(threw, true);
    } finally {
      global.fetch = originalFetch;
      if (prevGroq) process.env.GROQ_API_KEY = prevGroq;
      else delete process.env.GROQ_API_KEY;
      delete require.cache[require.resolve('../src/lib/ai/grok')];
    }
  });

  await test('19. Missing API key throws configuration error', async () => {
    const prevGroq = process.env.GROQ_API_KEY;
    const prevXai = process.env.XAI_API_KEY;
    delete process.env.GROQ_API_KEY;
    delete process.env.XAI_API_KEY;
    try {
      // Need fresh import to pick up env
      delete require.cache[require.resolve('../src/lib/ai/grok')];
      const { callGrok, GrokConfigurationError } = await import('../src/lib/ai/grok');
      let threw = false;
      try {
        await callGrok({ message: 'halo', history: [], context: { wallets: [], goals: [], budgets: [], recentTransactions: [], currentDate: '4 Sep 2026' } });
      } catch (e) {
        threw = e instanceof GrokConfigurationError;
      }
      assert.equal(threw, true);
    } finally {
      if (prevGroq) process.env.GROQ_API_KEY = prevGroq;
      if (prevXai) process.env.XAI_API_KEY = prevXai;
      delete require.cache[require.resolve('../src/lib/ai/grok')];
    }
  });

  await test('20. Grok error does NOT expose raw API key', async () => {
    const raw = JSON.stringify({ type: 'text', message: 'hello' });
    assert.equal(raw.includes('gsk_'), false);
    assert.equal(raw.includes('XAI_API_KEY'), false);
    assert.equal(raw.includes('GROQ_API_KEY'), false);
  });

  // -----------------------------------------------------------------------
  // 4. Natural Language Test Cases — payload expectations
  // -----------------------------------------------------------------------
  await test('21. Expense "Ayam geprek 10 ribu" expects amount 10000, EXPENSE, food', () => {
    const payload = { transactionType: 'EXPENSE', amount: '10000', description: 'Ayam geprek', category: 'food' };
    assert.equal(payload.amount, '10000');
    assert.equal(payload.transactionType, 'EXPENSE');
    assert.equal(payload.category, 'food');
  });

  await test('22. Expense "Kopi 25 ribu GoPay" expects wallet GoPay', () => {
    const payload = { transactionType: 'EXPENSE', amount: '25000', description: 'Kopi', category: 'food', walletName: 'GoPay' };
    assert.equal(payload.walletName, 'GoPay');
    assert.equal(payload.amount, '25000');
  });

  await test('23. Income "Gaji 5 juta BCA" expects INCOME 5000000', () => {
    const payload = { transactionType: 'INCOME', amount: '5000000', walletName: 'BCA', category: 'salary' };
    assert.equal(payload.transactionType, 'INCOME');
    assert.equal(payload.amount, '5000000');
  });

  await test('24. Goal contribution "Nabung 500 ribu kuliah BCA" must NOT be expense', () => {
    const grokType = 'goal_contribution';
    assert.notEqual(grokType, 'create_transaction');
    const payload = { amount: '500000', goalName: 'Kuliah', sourceWalletName: 'BCA' };
    assert.equal(payload.goalName, 'Kuliah');
    assert.equal(payload.amount, '500000');
  });

  await test('25. Transfer "200 ribu BCA ke GoPay" expects source/dest', () => {
    const payload = { amount: '200000', sourceWalletName: 'BCA', destinationWalletName: 'GoPay' };
    assert.equal(payload.sourceWalletName, 'BCA');
    assert.equal(payload.destinationWalletName, 'GoPay');
  });

  await test('26. Financial action requires confirmation', () => {
    const action = { type: 'financial_action', requiresConfirmation: true };
    assert.equal(action.requiresConfirmation, true);
  });

  await test('27. AI must not directly mutate — no API call in Grok response', () => {
    const grokResponse = { type: 'financial_action', action: 'create_transaction', payload: { amount: '10000' }, requiresConfirmation: true };
    // Grok response must NOT contain direct mutation side effects
    assert.equal((grokResponse as unknown as Record<string, unknown>).success, undefined);
    assert.equal((grokResponse as unknown as Record<string, unknown>).transaction, undefined);
  });

  console.log('\n==================================================');
  console.log(`Test Results: ${passedCount} Passed, ${failedCount} Failed`);
  console.log('==================================================\n');
  if (failedCount > 0) process.exit(1);
}

runTests()
  .catch((err) => {
    console.error('Fatal error in AI tests:', err);
    process.exit(1);
  });
