'use client';

import React from 'react';

export default function ChartLegend() {
  return (
    <div className="flex items-center gap-4 text-xs font-semibold select-none">
      <div className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-[#7C7CE6] shrink-0" />
        <span className="text-[#242636]">Pemasukan</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-[#7FA6FF] shrink-0" />
        <span className="text-[#757A95]">Pengeluaran</span>
      </div>
    </div>
  );
}
