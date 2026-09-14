'use client';

import React, { useState, useEffect } from 'react';
import { User, Mail, Camera, Check } from 'lucide-react';
import Modal from '@/components/ui/Modal';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialName: string;
  initialEmail: string;
  onSave: (name: string, email: string) => void;
}

export default function EditProfileModal({
  isOpen,
  onClose,
  initialName,
  initialEmail,
  onSave,
}: EditProfileModalProps) {
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);

  useEffect(() => {
    setName(initialName);
    setEmail(initialEmail);
  }, [initialName, initialEmail, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(name.trim(), email.trim());
    onClose();
  };

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Profil"
      subtitle="Perbarui nama tampilan dan informasi akun Anda"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5 pt-2">
        {/* Avatar Preview & Upload Indicator */}
        <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-[#FAFBFD] border border-black/[0.04]">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#7C7CE6] via-[#8C8BE8] to-[#D6E4FA] text-white flex items-center justify-center font-black text-lg shadow-sm">
              {initials || <User size={24} />}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white border border-[#E8EAF2] flex items-center justify-center text-[#757A95] shadow-xs">
              <Camera size={12} />
            </div>
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#242636]">Foto Profil</h4>
            <p className="text-[11px] text-[#757A95] mt-0.5">
              Avatar akan dibuat otomatis dari inisial nama akun Anda.
            </p>
          </div>
        </div>

        {/* Input Nama */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#242636] block">
            Nama Lengkap
          </label>
          <div className="relative">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Masukkan nama lengkap"
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-white border border-[#E8EAF2] text-xs font-semibold text-[#242636] placeholder-[#A0A4B8] focus:outline-none focus:border-[#7C7CE6] focus:ring-2 focus:ring-[#7C7CE6]/20 transition-all"
            />
            <User size={15} className="absolute left-3.5 top-3 text-[#A0A4B8]" />
          </div>
        </div>

        {/* Input Email */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#242636] block">
            Alamat Email
          </label>
          <div className="relative">
            <input
              type="email"
              value={email}
              readOnly
              disabled
              placeholder="user@example.com"
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-[#FAFBFD] border border-[#E8EAF2] text-xs font-semibold text-[#757A95] cursor-not-allowed opacity-80"
            />
            <Mail size={15} className="absolute left-3.5 top-3 text-[#A0A4B8]" />
          </div>
          <p className="text-[11px] text-[#A0A4B8] pl-1">
            Email terhubung dengan verifikasi keamanan akun (tidak dapat diubah langsung).
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-3 border-t border-[#E8EAF2]/80">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-10 rounded-xl bg-white border border-[#E8EAF2] hover:bg-[#FAFBFD] text-xs font-bold text-[#757A95] hover:text-[#242636] transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            className="flex-1 h-10 rounded-xl bg-[#7C7CE6] hover:bg-[#6867D4] active:scale-98 text-xs font-bold text-white shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Check size={14} />
            <span>Simpan Perubahan</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
