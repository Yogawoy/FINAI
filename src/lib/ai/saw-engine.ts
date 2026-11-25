/**
 * Deterministic Financial Health Score Engine using Simple Additive Weighting (SAW)
 * Implemented for FINAI Journal Research & System Evaluation (JTIIK)
 * Standard Financial Planning Benchmarks (OJK / CFP Standards):
 * 
 * - C1: Savings Rate (Benefit, w1 = 0.30)
 *       Benchmark: 20% savings rate is optimal (Score 1.0).
 *       Formula: min(1, max(0, rate / 0.20))
 * 
 * - C2: Expense-to-Income Ratio (Cost, w2 = 0.30)
 *       Benchmark: <= 70% of income is healthy (Score 1.0).
 *       Formula: ratio <= 0.70 ? 1.0 : ratio <= 1.0 ? (1.0 - ratio) / 0.30 : 0
 * 
 * - C3: Budget Adherence (Cost, w3 = 0.20)
 *       Benchmark: <= 85% of budget is safe (Score 1.0).
 *       Formula: usage <= 0.85 ? 1.0 : usage <= 1.0 ? (1.0 - usage) / 0.15 : max(0, 1 - (usage - 1))
 * 
 * - C4: Emergency Buffer / Liquidity Ratio (Benefit, w4 = 0.20)
 *       Benchmark: 3 months of monthly expenses is optimal (Score 1.0).
 *       Formula: min(1, balance / (3 * expense))
 * 
 * Classification:
 * - V >= 0.80: "Strong"
 * - 0.60 <= V < 0.80: "Stable"
 * - 0.40 <= V < 0.60: "Warning"
 * - V < 0.40: "Critical"
 */

export type FinancialHealthStatus = 'Strong' | 'Stable' | 'Warning' | 'Critical';

export interface FinancialProfileInput {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  totalBudgetLimit?: number;
  totalBudgetSpent?: number;
  totalGoalTarget?: number;
  totalGoalCurrent?: number;
}

export interface SAWCriteriaScores {
  c1_savingsRate: number;     // Benefit
  c2_expenseControl: number;  // Cost (inverted)
  c3_budgetAdherence: number; // Cost (inverted)
  c4_liquidityBuffer: number; // Benefit
}

export interface SAWCalculationResult {
  criteria: SAWCriteriaScores;
  weights: { c1: number; c2: number; c3: number; c4: number };
  sawScore: number;          // 0.000 - 1.000
  normalizedScore100: number; // 0.0 - 100.0
  status: FinancialHealthStatus;
  metrics: {
    netCashFlow: number;
    savingsRatePercent: number;
    expenseRatioPercent: number;
    budgetUtilizationPercent: number;
    liquidityMonths: number;
  };
  narrativeSummary: string;
}

export class SAWFinancialEngine {
  public static readonly WEIGHTS = {
    c1: 0.30, // Tabungan / Net Cash Flow Rate
    c2: 0.30, // Kontrol Pengeluaran vs Income
    c3: 0.20, // Kepatuhan Anggaran
    c4: 0.20, // Ketahanan Likuiditas / Dana Darurat
  };

  /**
   * Calculate deterministic financial health score and status classification using SAW
   */
  public static evaluate(profile: FinancialProfileInput): SAWCalculationResult {
    const income = Math.max(0, Number(profile.monthlyIncome) || 0);
    const expense = Math.max(0, Number(profile.monthlyExpense) || 0);
    const balance = Math.max(0, Number(profile.totalBalance) || 0);
    const budgetLimit = Math.max(0, Number(profile.totalBudgetLimit) || 0);
    const budgetSpent = Math.max(0, Number(profile.totalBudgetSpent) || 0);

    const netCashFlow = income - expense;

    // --- C1: Savings Rate (Benefit) ---
    // Benchmark: 20% savings rate is optimal (1.0)
    let c1 = 0;
    let savingsRatePercent = 0;
    if (income > 0) {
      const rate = netCashFlow / income;
      savingsRatePercent = Math.round(rate * 1000) / 10;
      if (rate >= 0.20) {
        c1 = 1.0;
      } else if (rate > 0) {
        c1 = rate / 0.20;
      } else {
        c1 = 0.0;
      }
    } else if (expense === 0) {
      c1 = 0.5; // neutral baseline when no activity
      savingsRatePercent = 0;
    } else {
      c1 = 0.0; // pure deficit
      savingsRatePercent = -100;
    }

    // --- C2: Expense Control (Cost Criterion) ---
    // Benchmark: <= 70% of income is healthy (1.0), 70%-100% scales to 0, >100% is 0
    let c2 = 0;
    let expenseRatioPercent = 0;
    if (income > 0) {
      const ratio = expense / income;
      expenseRatioPercent = Math.round(ratio * 1000) / 10;
      if (ratio <= 0.70) {
        c2 = 1.0;
      } else if (ratio <= 1.0) {
        c2 = Math.max(0, (1.0 - ratio) / 0.30);
      } else {
        c2 = 0.0; // deficit
      }
    } else if (expense === 0) {
      c2 = 0.5;
      expenseRatioPercent = 0;
    } else {
      c2 = 0.0;
      expenseRatioPercent = 999;
    }

    // --- C3: Budget Adherence (Cost Criterion) ---
    // Benchmark: <= 85% of budget is healthy (1.0), 85%-100% scales down, >100% penalizes
    let c3 = 1.0;
    let budgetUtilizationPercent = 0;
    if (budgetLimit > 0) {
      const usage = budgetSpent / budgetLimit;
      budgetUtilizationPercent = Math.round(usage * 1000) / 10;
      if (usage <= 0.85) {
        c3 = 1.0;
      } else if (usage <= 1.0) {
        c3 = Math.max(0, (1.0 - usage) / 0.15);
      } else {
        // Overbudget penalty
        c3 = Math.max(0, 1.0 - (usage - 1.0));
      }
    } else if (expense > 0 && income > 0) {
      c3 = expense <= income ? 0.8 : 0.2;
      budgetUtilizationPercent = Math.round((expense / income) * 1000) / 10;
    }

    // --- C4: Emergency Buffer / Liquidity (Benefit Criterion) ---
    // Benchmark: 3 months of monthly expense
    let c4 = 0;
    let liquidityMonths = 0;
    if (expense > 0) {
      liquidityMonths = Math.round((balance / expense) * 10) / 10;
      const targetBuffer = 3 * expense;
      c4 = Math.min(1.0, balance / targetBuffer);
    } else if (balance > 0) {
      c4 = 1.0;
      liquidityMonths = 99;
    } else {
      c4 = 0.0;
      liquidityMonths = 0;
    }

    // --- SAW Aggregation (V = sum(w_i * r_i)) ---
    const w = this.WEIGHTS;
    const sawScore = Math.round((c1 * w.c1 + c2 * w.c2 + c3 * w.c3 + c4 * w.c4) * 1000) / 1000;
    const normalizedScore100 = Math.round(sawScore * 1000) / 10;

    // --- Deterministic Status Classification ---
    let status: FinancialHealthStatus = 'Critical';
    if (sawScore >= 0.80) {
      status = 'Strong';
    } else if (sawScore >= 0.60) {
      status = 'Stable';
    } else if (sawScore >= 0.40) {
      status = 'Warning';
    } else {
      status = 'Critical';
    }

    // Explicit narrative explanation
    const narrativeSummary =
      `Skor SAW: ${normalizedScore100}/100 [Status: ${status}]. ` +
      `Arus kas bersih: Rp${netCashFlow.toLocaleString('id-ID')} (Savings Rate: ${savingsRatePercent}%), ` +
      `Rasio Beban: ${expenseRatioPercent}%, Pemakaian Anggaran: ${budgetUtilizationPercent}%, ` +
      `Ketahanan Likuiditas: ${liquidityMonths} bulan pengeluaran.`;

    return {
      criteria: {
        c1_savingsRate: Math.round(c1 * 1000) / 1000,
        c2_expenseControl: Math.round(c2 * 1000) / 1000,
        c3_budgetAdherence: Math.round(c3 * 1000) / 1000,
        c4_liquidityBuffer: Math.round(c4 * 1000) / 1000,
      },
      weights: w,
      sawScore,
      normalizedScore100,
      status,
      metrics: {
        netCashFlow,
        savingsRatePercent,
        expenseRatioPercent,
        budgetUtilizationPercent,
        liquidityMonths,
      },
      narrativeSummary,
    };
  }
}
