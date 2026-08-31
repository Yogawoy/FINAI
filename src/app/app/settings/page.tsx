'use client';

import React, { useState } from 'react';
import {
  User,
  Shield,
  Bell,
  Sparkles,
  Sliders,
  Check,
} from 'lucide-react';
import Header from '@/components/navigation/Header';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import CustomSelect from '@/components/ui/CustomSelect';
import { USER_PROFILE } from '@/data/mockData';

export default function SettingsPage() {
  const [userName, setUserName] = useState(USER_PROFILE.fullName);
  const [userEmail, setUserEmail] = useState(USER_PROFILE.email);
  const [currency, setCurrency] = useState('IDR (Rp)');
  const [savedAlert, setSavedAlert] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedAlert(true);
    setTimeout(() => setSavedAlert(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <Header
        title="Pengaturan & Preferensi"
        subtitle="Kelola profil, tampilan visual, dan preferensi akun FinAI kamu"
      />

      {savedAlert && (
        <div className="p-4 rounded-2xl bg-[#D0EFE5] border border-[#1B7354]/20 text-[#1B7354] text-xs font-semibold flex items-center gap-2">
          <Check size={16} />
          <span>Preferensi berhasil diperbarui dalam memori prototipe lokal.</span>
        </div>
      )}

      {/* Profil Section */}
      <GlassCard className="p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-black/[0.05]">
          <div className="w-10 h-10 rounded-2xl bg-[#E4E2FB] flex items-center justify-center text-[#7C7CE6]">
            <User size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#242636]">Identitas Profil</h3>
            <p className="text-xs text-[#757A95]">Data identifikasi personal dan tingkatan keanggotaan</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-[#757A95] block mb-1">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full px-4 py-2.5 bg-black/[0.02] border border-black/[0.06] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7C7CE6]/50 focus:bg-white text-[#242636]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#757A95] block mb-1">
                Alamat Email
              </label>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-black/[0.02] border border-black/[0.06] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7C7CE6]/50 focus:bg-white text-[#242636]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <CustomSelect
                label="Mata Uang Utama"
                value={currency}
                onChange={setCurrency}
                options={[
                  { value: 'IDR (Rp)', label: 'Rupiah Indonesia (IDR - Rp)' },
                  { value: 'USD ($)', label: 'Dolar Amerika (USD - $)' },
                  { value: 'SGD (S$)', label: 'Dolar Singapura (SGD - S$)' },
                ]}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#757A95] block mb-1">
                Tingkat Keanggotaan
              </label>
              <div className="px-4 py-2.5 bg-[#E4E2FB]/50 border border-[#7C7CE6]/20 rounded-xl text-sm font-bold text-[#7C7CE6] flex items-center justify-between">
                <span>FinAI Pro Prioritas</span>
                <Badge variant="mint" size="sm">Aktif</Badge>
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button type="submit" variant="primary" size="md">
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </GlassCard>

      {/* Visual & Interactivity Preferences */}
      <GlassCard className="p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-black/[0.05]">
          <div className="w-10 h-10 rounded-2xl bg-[#D0EFE5] flex items-center justify-center text-[#1B7354]">
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#242636]">Pengalaman Visual</h3>
            <p className="text-xs text-[#757A95]">Kustomisasi interaksi gerak dan tema antarmuka</p>
          </div>
        </div>

        <div className="space-y-4 text-xs sm:text-sm">
          <div className="flex items-center justify-between py-2">
            <div>
              <span className="font-bold text-[#242636] block">Kemiringan Kartu Interaktif (3D Tilt)</span>
              <span className="text-xs text-[#757A95]">Kartu dompet merespons pergerakan kursor mouse</span>
            </div>
            <Badge variant="mint" size="sm">Aktif</Badge>
          </div>

          <div className="flex items-center justify-between py-2 border-t border-black/[0.04]">
            <div>
              <span className="font-bold text-[#242636] block">Format Angka Rupiah Otomatis</span>
              <span className="text-xs text-[#757A95]">Semua transaksi diformat standar IDR (Rp)</span>
            </div>
            <Badge variant="mint" size="sm">Aktif</Badge>
          </div>

          <div className="flex items-center justify-between py-2 border-t border-black/[0.04]">
            <div>
              <span className="font-bold text-[#242636] block">Animasi Hitung Halus</span>
              <span className="text-xs text-[#757A95]">Transisi perubahan saldo beranimasi lancar</span>
            </div>
            <Badge variant="mint" size="sm">Aktif</Badge>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
