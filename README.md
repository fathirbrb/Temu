# TEMU - Tetap Dekat Meski Berjauhan 👵👴💚

**TEMU** adalah platform web modern, minimalis, dan ramah pengguna (*elderly & mobile friendly*) yang dirancang untuk membantu kader dan tenaga kesehatan Posyandu dalam mendata lansia serta memantau kondisi kesehatan mereka secara berkala.

Aplikasi ini mengintegrasikan **React (TypeScript)**, **Vite**, **React Router DOM**, dan **Supabase** sebagai sistem database & autentikasi real-time.

---

## 🎨 Palet Warna & Tema Desain
Platform TEMU menggunakan palet warna bernuansa hangat, ramah, dan menenangkan:
- **Primary Color:** `#7C9A92` (Sage Green)
- **Secondary Color:** `#A8C3BC` (Soft Mint)
- **Background:** `#F8F6F2` (Warm Off-White)
- **Text:** `#2F3A38` (Teal-Charcoal Tua)

---

## 🚀 Fitur Utama
1. **Autentikasi & Verifikasi Peran (Role-Based Access Control):**
   - Pengguna masuk menggunakan Supabase Auth.
   - Pengecekan profil otomatis di tabel database `profiles`. Jika tidak terdaftar, akses ditolak (`/unauthorized`) untuk keamanan data pasien.
   - Mendukung multi-role: `admin`, `kader`, `tenaga_kesehatan`, dan `keluarga`.
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

## 📊 Klasifikasi Risiko Kesehatan
Kalkulasi status kesehatan dilakukan otomatis dengan ketentuan thresholds berikut:

| Status Risiko | Tekanan Darah (Sistolik) | Gula Darah | Kolesterol | Warna Badge |
| :--- | :--- | :--- | :--- | :--- |
| **Bahaya** | $\ge 160\text{ mmHg}$ | $\ge 200\text{ mg/dL}$ | $\ge 240\text{ mg/dL}$ | Merah 🔴 |
| **Waspada** | $\ge 140\text{ mmHg}$ | $\ge 140\text{ mg/dL}$ | $\ge 200\text{ mg/dL}$ | Kuning 🟡 |
| **Normal** | $< 140\text{ mmHg}$ | $< 140\text{ mg/dL}$ | $< 200\text{ mg/dL}$ | Hijau 🟢 |

*Catatan: Jika salah satu parameter memenuhi batas risiko di atas, status tertinggi akan langsung diterapkan.*

---

## 🛠️ Tech Stack
- **Frontend Framework:** React 19 (TypeScript)
- **Build Tool:** Vite 8
- **Routing:** React Router DOM v7
- **Database & Auth:** Supabase Client v2
- **Styling:** Custom Vanilla CSS (Responsive Mobile & Desktop)

---

## 💾 Struktur Database Supabase

### 1. Tabel `profiles` (Menyimpan data pengguna terdaftar)
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nama TEXT NOT NULL,
  role TEXT CHECK (role IN ('admin', 'kader', 'tenaga_kesehatan', 'keluarga')) NOT NULL,
  no_hp TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

### 2. Tabel `lansia` (Menyimpan biodata lansia)
```sql
CREATE TABLE lansia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nik TEXT UNIQUE NOT NULL,
  nama TEXT NOT NULL,
  tanggal_lahir DATE NOT NULL,
  jenis_kelamin TEXT CHECK (jenis_kelamin IN ('L', 'P')) NOT NULL,
  alamat TEXT NOT NULL,
  no_hp TEXT,
  nama_keluarga TEXT,
  no_hp_keluarga TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

### 3. Tabel `pemeriksaan` (Menyimpan rekam medis pemeriksaan berkala)
```sql
CREATE TABLE pemeriksaan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lansia_id UUID REFERENCES lansia(id) ON DELETE CASCADE NOT NULL,
  tanggal_pemeriksaan DATE NOT NULL,
  tekanan_darah INTEGER NOT NULL,
  berat_badan NUMERIC(5,2),
  tinggi_badan NUMERIC(5,2),
  gula_darah INTEGER,
  kolesterol INTEGER,
  status TEXT CHECK (status IN ('normal', 'waspada', 'bahaya')) NOT NULL,
  catatan TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

---

## ⚙️ Petunjuk Pemasangan (Installation Guide)

Ikuti langkah-langkah di bawah ini untuk menjalankan project TEMU di lingkungan lokal Anda:

### 1. Prasyarat (Prerequisites)
Pastikan Anda sudah menginstal:
- **Node.js** (Versi 18 ke atas direkomendasikan)
- **NPM** (Node Package Manager)

### 2. Clone Repository
Unduh repository ini menggunakan terminal/git bash:
```bash
git clone https://github.com/username/temu.git
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
