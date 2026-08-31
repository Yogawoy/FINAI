'use client';

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import { formatIDR, MOCK_BUDGET_DAILY_TREND, DailySpendingPoint } from '@/data/mockData';

interface BudgetTrendChartProps {
  data?: DailySpendingPoint[];
  categoryColor?: string;
  categoryName?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: DailySpendingPoint;
  }>;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="bg-[#242636] text-white px-3 py-2 rounded-xl text-xs shadow-lg border border-white/10 space-y-0.5">
        <p className="font-bold text-[#E4E2FB]">{item.dayFull}</p>
        <p className="text-sm font-extrabold text-white">{formatIDR(item.amount)}</p>
      </div>
    );
  }
  return null;
};

export default function BudgetTrendChart({
  data = MOCK_BUDGET_DAILY_TREND,
  categoryColor = '#7C7CE6',
  categoryName = 'Category',
}: BudgetTrendChartProps) {
  const maxAmount = Math.max(...data.map((d) => d.amount));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#7C7CE6] block">
            Spending Trend
          </span>
          <h5 className="text-xs sm:text-sm font-bold text-[#242636]">
            Daily Spending (This Week)
          </h5>
        </div>
        <span className="text-[11px] text-[#757A95] font-semibold bg-[#F4F3F9] px-2.5 py-0.5 rounded-full">
          Peak: {formatIDR(maxAmount)}
        </span>
      </div>

      <div className="h-44 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="day"
              stroke="#757A95"
              fontSize={11}
              fontWeight={600}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#757A95"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `Rp${v / 1000}k`}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: 'rgba(124, 124, 230, 0.06)', radius: 8 }}
            />
            <Bar
              dataKey="amount"
              radius={[8, 8, 4, 4]}
              maxBarSize={36}
            >
              {data.map((entry, index) => {
                const isMax = entry.amount === maxAmount;
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={isMax ? '#7C7CE6' : '#C7C6F5'}
                    className="hover:opacity-85 transition-opacity"
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
