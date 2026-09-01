'use client';

import React from 'react';
import { Target, Plus, Search } from 'lucide-react';
import { GoalItem } from '@/types';
import Button from '@/components/ui/Button';
import GoalCard from './GoalCard';

interface GoalListProps {
  goals: GoalItem[];
  onSelectGoal: (goal: GoalItem) => void;
  onAddContribution: (goal: GoalItem) => void;
  onCreateGoal: () => void;
  isFiltered: boolean;
}

export default function GoalList({
  goals,
  onSelectGoal,
  onAddContribution,
  onCreateGoal,
  isFiltered,
}: GoalListProps) {
  if (goals.length === 0) {
    if (isFiltered) {
      return (
        <div className="p-10 rounded-[28px] bg-white border border-black/[0.05] shadow-2xs text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#F4F3F9] text-[#757A95] flex items-center justify-center mx-auto">
            <Search size={22} />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-bold text-[#242636]">
              Target Tidak Ditemukan
            </h4>
            <p className="text-xs text-[#757A95] max-w-sm mx-auto">
              Tidak ada target yang sesuai dengan kata kunci atau filter yang Anda pilih.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="p-12 sm:p-14 rounded-[32px] bg-white border border-black/[0.05] shadow-2xs text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-[#EDEAFC] text-[#5F5ED4] flex items-center justify-center mx-auto shadow-xs">
          <Target size={28} />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-xl font-bold text-[#242636]">Belum Ada Target</h3>
          <p className="text-xs sm:text-sm text-[#757A95] max-w-md mx-auto leading-relaxed">
            Mulai buat target pertamamu dan ubah rencana menjadi sesuatu yang nyata.
          </p>
        </div>
        <div className="pt-2">
          <Button
            variant="primary"
            size="md"
            icon={<Plus size={16} />}
            onClick={onCreateGoal}
          >
            Buat Target
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
      {goals.map((goal) => (
        <GoalCard
          key={goal.id}
          goal={goal}
          onClick={() => onSelectGoal(goal)}
          onAddContribution={() => onAddContribution(goal)}
        />
      ))}
    </div>
  );
}
