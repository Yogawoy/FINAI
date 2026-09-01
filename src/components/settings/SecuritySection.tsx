'use client';

import React, { useState } from 'react';
import { KeyRound, Smartphone, ShieldCheck, Check, Lock, Shield } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import Modal from '@/components/ui/Modal';
import SettingRow from './SettingRow';
import SettingToggle from './SettingToggle';

interface SecuritySectionProps {
  pinLockEnabled: boolean;
  onPinLockChange: (val: boolean) => void;
  onTriggerToast: (msg: string) => void;
}

export default function SecuritySection({
  pinLockEnabled,
  onPinLockChange,
  onTriggerToast,
}: SecuritySectionProps) {
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

  // Password fields
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // PIN fields
  const [pinDigits, setPinDigits] = useState(['', '', '', '', '', '']);

  // Active Sessions
  const [activeSessions, setActiveSessions] = useState([
    { id: 's-1', device: 'Windows PC • Chrome', location: 'Jakarta, Indonesia', isCurrent: true },
    { id: 's-2', device: 'iPhone 15 Pro • Safari', location: 'Jakarta, Indonesia', time: '3 jam yang lalu' },
    { id: 's-3', device: 'MacBook Air • Firefox', location: 'Bandung, Indonesia', time: '2 hari yang lalu' },
  ]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword !== confirmPassword) return;
    setIsPasswordModalOpen(false);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    onTriggerToast('Password akun berhasil diperbarui.');
  };

  const handlePinDigitChange = (index: number, val: string) => {
    if (val.length > 1) val = val.slice(-1);
    const newArr = [...pinDigits];
    newArr[index] = val;
    setPinDigits(newArr);

    // Auto-focus next input
    if (val && index < 5) {
      const nextInput = document.getElementById(`pin-digit-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleSavePin = () => {
    const fullPin = pinDigits.join('');
    if (fullPin.length === 6) {
      setIsPinModalOpen(false);
      onTriggerToast('PIN keamanan 6-digit berhasil disimpan.');
    }
  };

  const terminateSession = (id: string) => {
    setActiveSessions((prev) => prev.filter((s) => s.id !== id));
    onTriggerToast('Sesi perangkat berhasil dihentikan.');
  };

  return (
    <div className="space-y-2.5">
      <span className="text-[11px] font-bold text-[#757A95] uppercase tracking-wider block pl-1">
        Keamanan & Proteksi Akses
      </span>

      <GlassCard className="divide-y divide-[#E8EAF2]/60">
        {/* 1. PIN Keamanan Transaksi */}
        <SettingRow
          icon={<Lock size={16} className="text-[#5F5ED4]" />}
          title="Kunci PIN Transaksi"
          description="Wajibkan otorisasi PIN 6-digit sebelum melakukan setoran target atau transfer antar dompet"
          action={
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsPinModalOpen(true)}
                className="h-8 px-3 rounded-xl bg-white border border-[#E8EAF2] hover:border-[#7C7CE6]/50 text-[11px] font-bold text-[#7C7CE6] transition-colors cursor-pointer"
              >
                Atur PIN
              </button>
              <SettingToggle
                checked={pinLockEnabled}
                onChange={onPinLockChange}
                aria-label="Toggle PIN Transaksi"
              />
            </div>
          }
        />

        {/* 2. Password Akun */}
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
              Ubah Kata Sandi
            </button>
          }
        />

        {/* 3. Sesi Masuk Aktif */}
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
              Kelola Sesi ({activeSessions.length})
            </button>
          }
        />
      </GlassCard>

      {/* Modal Atur PIN 6-Digit */}
      <Modal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        title="Atur PIN Keamanan"
        subtitle="PIN 6-digit digunakan untuk otorisasi transfer dan pencatatan finansial sensitif"
        maxWidth="sm"
      >
        <div className="space-y-6 pt-2 text-center">
          <div className="flex justify-center gap-2">
            {pinDigits.map((digit, i) => (
              <input
                key={i}
                id={`pin-digit-${i}`}
                type="password"
                maxLength={1}
                value={digit}
                onChange={(e) => handlePinDigitChange(i, e.target.value)}
                className="w-10 h-12 text-center rounded-xl bg-white border-2 border-[#E8EAF2] text-lg font-black text-[#242636] focus:outline-none focus:border-[#7C7CE6] transition-all"
              />
            ))}
          </div>

          <p className="text-[11px] text-[#757A95]">
            Jangan gunakan tanggal lahir atau kombinasi angka berurutan yang mudah ditebak.
          </p>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsPinModalOpen(false)}
              className="flex-1 h-10 rounded-xl bg-white border border-[#E8EAF2] text-xs font-bold text-[#757A95] cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={pinDigits.some((d) => !d)}
              onClick={handleSavePin}
              className="flex-1 h-10 rounded-xl bg-[#7C7CE6] hover:bg-[#6867D4] disabled:opacity-40 text-xs font-bold text-white shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Check size={14} />
              <span>Simpan PIN</span>
            </button>
          </div>
        </div>
      </Modal>

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
          {activeSessions.map((session) => (
            <div
              key={session.id}
              className={`p-3.5 rounded-2xl border flex items-center justify-between transition-colors ${
                session.isCurrent
                  ? 'bg-[#FAFBFD] border-black/[0.06]'
                  : 'bg-white border-[#E8EAF2]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    session.isCurrent
                      ? 'bg-[#EDEAFC] text-[#5F5ED4]'
                      : 'bg-[#FAFBFD] text-[#757A95]'
                  }`}
                >
                  <Smartphone size={16} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-[#242636]">{session.device}</h4>
                    {session.isCurrent && (
                      <span className="px-1.5 py-0.2 rounded-md bg-[#EBF7F2] text-[10px] font-bold text-[#1B7354]">
                        Perangkat Ini
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#757A95]">
                    {session.location} • {session.isCurrent ? 'Aktif sekarang' : session.time}
                  </p>
                </div>
              </div>

              {!session.isCurrent && (
                <button
                  type="button"
                  onClick={() => terminateSession(session.id)}
                  className="text-[11px] font-bold text-[#D94F4F] hover:underline cursor-pointer"
                >
                  Hentikan
                </button>
              )}
            </div>
          ))}

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
