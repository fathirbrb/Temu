# TEMU - Tetap Dekat Meski Berjauhan

**TEMU** adalah platform web modern, minimalis, dan ramah pengguna (*elderly & mobile friendly*) yang dirancang untuk membantu kader dan tenaga kesehatan Posyandu dalam mendata lansia serta memantau kondisi kesehatan mereka secara berkala.

## Fitur Utama
1. **Autentikasi & Verifikasi Peran (Role-Based Access Control):**
   - Pengguna masuk menggunakan Supabase Auth.
   - Pengecekan profil otomatis di tabel database `profiles`. Jika tidak terdaftar, akses ditolak (`/unauthorized`) untuk keamanan data pasien.
   - Mendukung multi-role: `admin`, `kader`, dan `keluarga`.
2. **Dashboard Pemantauan Real-time (`/`):**
   - Menampilkan total lansia terdaftar dan total pemeriksaan.
   - Rekap otomatis jumlah lansia dengan kondisi **Normal**, **Waspada**, dan **Bahaya**.
   - Log 5 riwayat pemeriksaan kesehatan terbaru.
3. **Manajemen Lansia (`/lansia` & `/lansia/:id`):**
   - CRUD data lansia lengkap menggunakan modal form pop-up.
   - Fitur pencarian real-time ganda berdasarkan **Nama** dan **NIK**.
   - Validasi data wajib (NIK & Nama).
   - Tampilan profil detail informasi lansia dan penanggung jawab keluarga.
4. **Pencatatan Pemeriksaan Kesehatan (`/pemeriksaan`):**
   - Pencatatan vitalitas tubuh lansia (Tensi, Berat Badan, Tinggi, Gula Darah, Kolesterol, Catatan).
   - **Kalkulator Risiko Kesehatan Instan (Live Preview):** Otomatis mendeteksi status risiko kesehatan langsung di form modal saat kader mengetik angka tensi, gula, atau kolesterol sebelum disimpan.
   - Manajemen hapus dan edit laporan dengan sinkronisasi database instan.

---

## Klasifikasi Risiko Kesehatan
Kalkulasi status kesehatan dilakukan otomatis dengan ketentuan thresholds berikut:

| Status Risiko | Tekanan Darah (Sistolik) | Gula Darah | Kolesterol | Warna Badge |
| :--- | :--- | :--- | :--- | :--- |
| **Bahaya** | $\ge 160\text{ mmHg}$ | $\ge 200\text{ mg/dL}$ | $\ge 240\text{ mg/dL}$ | Merah 🔴 |
| **Waspada** | $\ge 140\text{ mmHg}$ | $\ge 140\text{ mg/dL}$ | $\ge 200\text{ mg/dL}$ | Kuning 🟡 |
| **Normal** | $< 140\text{ mmHg}$ | $< 140\text{ mg/dL}$ | $< 200\text{ mg/dL}$ | Hijau 🟢 |

## Petunjuk Pemasangan (Installation Guide)
Ikuti langkah-langkah di bawah ini untuk menjalankan project TEMU di lingkungan lokal Anda:

### 1. Prasyarat (Prerequisites)
Pastikan Anda sudah menginstal:
- **Node.js** (Versi 18 ke atas direkomendasikan)
- **NPM** (Node Package Manager)

### 2. Clone Repository
Unduh repository ini menggunakan terminal/git bash:
```bash
git clone https://github.com/fathirbrb/temu.git
cd temu
```

### 3. Instal Dependensi
Jalankan perintah ini di direktori project untuk memasang semua modul yang dibutuhkan:
```bash
npm install
```

### 4. Konfigurasi Variabel Lingkungan (`.env`)
Buat sebuah file bernama `.env` di direktori utama (root) project, lalu isi dengan konfigurasi Supabase Anda:
```env
VITE_SUPABASE_URL=https://nama_project_anda.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=token_key_publishable_supabase_anda
```

### 5. Setup Database di Supabase
1. Masuk ke dashboard Supabase Anda.
2. Buka menu **SQL Editor**.
3. Buat file SQL baru dan tempelkan perintah query DDL untuk tabel `profiles`, `lansia`, dan `pemeriksaan` (seperti yang dijabarkan pada bagian **Struktur Database** di atas).
4. Klik **Run** untuk membuat tabel.
5. Jalankan query helper tambahan jika diperlukan:
   ```sql
   ALTER TABLE lansia ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
   ```

### 6. Jalankan Server Dev Lokal
Jalankan server pengembangan lokal dengan perintah:
```bash
npm run dev
```
Buka browser Anda di alamat `http://localhost:5173` (atau port alternatif yang tercetak di terminal Anda).

### 7. Build untuk Produksi
Jika ingin memaketkan aplikasi untuk kebutuhan hosting, jalankan perintah:
```bash
npm run build
npm run preview
```
