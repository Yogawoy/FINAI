'use client';

import React, { useState } from 'react';
import { KeyRound, Smartphone, ShieldCheck, Check } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import Modal from '@/components/ui/Modal';
import SettingRow from './SettingRow';

interface SecuritySectionProps {
  onTriggerToast: (msg: string) => void;
}

export default function SecuritySection({ onTriggerToast }: SecuritySectionProps) {
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword !== confirmPassword) return;
    setIsPasswordModalOpen(false);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    onTriggerToast('Password akun berhasil diperbarui.');
  };

  return (
    <div className="space-y-2.5">
      <span className="text-[11px] font-bold text-[#757A95] uppercase tracking-wider block pl-1">
        Keamanan & Akses
      </span>

      <GlassCard className="divide-y divide-[#E8EAF2]/60">
        {/* 1. Password */}
        <SettingRow
          icon={<KeyRound size={16} />}
          title="Kata Sandi Akun"
          description="Perbarui kata sandi secara berkala untuk menjaga perlindungan akun Anda"
          action={
            <button
              type="button"
              onClick={() => setIsPasswordModalOpen(true)}
              className="h-8.5 px-3.5 rounded-xl bg-white border border-[#E8EAF2] hover:border-[#7C7CE6]/50 hover:bg-[#FAFBFD] text-xs font-bold text-[#242636] transition-all cursor-pointer shadow-2xs"
            >
              Ubah Password
            </button>
          }
        />

        {/* 2. Sesi Aktif */}
        <SettingRow
          icon={<Smartphone size={16} />}
          title="Sesi Masuk Aktif"
          description="Kelola daftar perangkat dan lokasi yang saat ini memiliki akses ke akun FinAI"
          action={
            <button
              type="button"
              onClick={() => setIsSessionModalOpen(true)}
              className="h-8.5 px-3.5 rounded-xl bg-white border border-[#E8EAF2] hover:border-[#7C7CE6]/50 hover:bg-[#FAFBFD] text-xs font-bold text-[#242636] transition-all cursor-pointer shadow-2xs"
            >
              Kelola Sesi
            </button>
          }
        />
      </GlassCard>

      {/* Modal Ubah Password */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title="Ubah Kata Sandi"
        subtitle="Pastikan menggunakan kombinasi kata sandi yang aman dan unik"
        maxWidth="md"
      >
        <form onSubmit={handlePasswordSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#242636] block">
              Kata Sandi Saat Ini
            </label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
              placeholder="Masukkan password lama"
              className="w-full h-10 px-3.5 rounded-xl bg-white border border-[#E8EAF2] text-xs font-semibold text-[#242636] focus:outline-none focus:border-[#7C7CE6] focus:ring-2 focus:ring-[#7C7CE6]/20 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#242636] block">
              Kata Sandi Baru
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder="Minimal 8 karakter"
              className="w-full h-10 px-3.5 rounded-xl bg-white border border-[#E8EAF2] text-xs font-semibold text-[#242636] focus:outline-none focus:border-[#7C7CE6] focus:ring-2 focus:ring-[#7C7CE6]/20 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#242636] block">
              Konfirmasi Kata Sandi Baru
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Ulangi password baru"
              className="w-full h-10 px-3.5 rounded-xl bg-white border border-[#E8EAF2] text-xs font-semibold text-[#242636] focus:outline-none focus:border-[#7C7CE6] focus:ring-2 focus:ring-[#7C7CE6]/20 transition-all"
            />
          </div>

          <div className="flex items-center gap-3 pt-3 border-t border-[#E8EAF2]/80">
            <button
              type="button"
              onClick={() => setIsPasswordModalOpen(false)}
              className="flex-1 h-10 rounded-xl bg-white border border-[#E8EAF2] hover:bg-[#FAFBFD] text-xs font-bold text-[#757A95] cursor-pointer transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 h-10 rounded-xl bg-[#7C7CE6] hover:bg-[#6867D4] text-xs font-bold text-white shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Check size={14} />
              <span>Simpan Kata Sandi</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Kelola Sesi */}
      <Modal
        isOpen={isSessionModalOpen}
        onClose={() => setIsSessionModalOpen(false)}
        title="Sesi Masuk Aktif"
        subtitle="Daftar perangkat yang saat ini tersambung ke akun FinAI"
        maxWidth="md"
      >
        <div className="space-y-3 pt-2">
          <div className="p-3.5 rounded-2xl bg-[#FAFBFD] border border-black/[0.04] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#EDEAFC] text-[#5F5ED4] flex items-center justify-center">
                <Smartphone size={16} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-[#242636]">Windows PC • Chrome</h4>
                  <span className="px-1.5 py-0.2 rounded-md bg-[#EBF7F2] text-[10px] font-bold text-[#1B7354]">
                    Perangkat Ini
                  </span>
                </div>
                <p className="text-[11px] text-[#757A95]">Jakarta, Indonesia • Aktif sekarang</p>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-[#E8EAF2] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#FAFBFD] text-[#757A95] flex items-center justify-center">
                <Smartphone size={16} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#242636]">iPhone 15 Pro • Safari</h4>
                <p className="text-[11px] text-[#757A95]">Jakarta, Indonesia • 3 jam yang lalu</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onTriggerToast('Sesi perangkat lain berhasil dihentikan.')}
              className="text-[11px] font-bold text-[#D94F4F] hover:underline cursor-pointer"
            >
              Hentikan
            </button>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => setIsSessionModalOpen(false)}
              className="w-full h-10 rounded-xl bg-[#FAFBFD] border border-[#E8EAF2] text-xs font-bold text-[#242636] hover:bg-[#F3F4F9] transition-colors cursor-pointer"
            >
              Selesai
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
