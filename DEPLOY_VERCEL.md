# Panduan Deploy FinAI ke Vercel

Panduan ringkas untuk deploy aplikasi FinAI ke **Vercel** dengan database PostgreSQL cloud gratis.

---

## 1. Siapkan Database PostgreSQL Cloud (Gratis)

Pilih salah satu penyedia database PostgreSQL cloud gratis:
* **[Neon.tech](https://neon.tech)** *(Sangat direkomendasikan untuk Vercel / serverless)*
* **[Supabase.com](https://supabase.com)**

### Cara di Neon.tech:
1. Daftar/login di [neon.tech](https://neon.tech).
2. Buat project baru bernama `finai`.
3. Salin connection string yang diberikan, pilih mode **Pooled connection** (port 5432 / pooled connection string).
   Contoh format:
   ```
   postgresql://username:password@ep-xyz.us-east-2.aws.neon.tech/finai?sslmode=require
   ```

---

## 2. Migrasikan Schema & Data ke Database Cloud

Buka PowerShell / Terminal di laptop Anda (pada folder proyek ini):

```powershell
# Ganti URL di bawah dengan DATABASE_URL dari Neon/Supabase Anda
$env:DATABASE_URL="postgresql://username:password@ep-xyz.neon.tech/finai?sslmode=require"

# Push schema Prisma ke database cloud
npx prisma db push

# (Opsional) Masukkan seed data awal (demo user, default wallets)
npx prisma db seed
```

---

## 3. Deploy ke Vercel

1. Buka [vercel.com](https://vercel.com) dan login dengan akun GitHub Anda.
2. Klik tombol **Add New...** → **Project**.
3. Pilih repository **Yogawoy/FINAI**.
4. Di bagian **Environment Variables**, tambahkan:

| Key | Value | Keterangan |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql://...` | Connection string dari Neon/Supabase |
| `AUTH_SECRET` | `finai-super-secret-auth-key-at-least-32-chars-long` | Kunci rahasia sesi auth (minimal 32 karakter) |
| `GROQ_API_KEY` | `gsk_...` | API Key dari [console.groq.com/keys](https://console.groq.com/keys) |

5. Klik tombol **Deploy**.
6. Selesai! Vercel akan otomatis menjalankan `prisma generate && next build` dan situs FinAI Anda langsung aktif online! 🚀
