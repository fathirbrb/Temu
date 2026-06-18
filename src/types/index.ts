export interface Profile {
  id: string;
  nama: string;
  role: 'admin' | 'kader' | 'tenaga_kesehatan' | 'keluarga';
  no_hp: string | null;
  created_at: string;
}

export interface Lansia {
  id: string;
  nik: string;
  nama: string;
  tanggal_lahir: string;
  jenis_kelamin: 'L' | 'P';
  alamat: string;
  no_hp: string | null;
  nama_keluarga: string | null;
  no_hp_keluarga: string | null;
  is_active?: boolean;
  created_at?: string;
}

export interface Pemeriksaan {
  id: string;
  lansia_id: string;
  tanggal_pemeriksaan: string;
  tekanan_darah: number;
  berat_badan: number;
  tinggi_badan: number;
  gula_darah: number;
  kolesterol: number;
  status: 'normal' | 'waspada' | 'bahaya';
  catatan: string | null;
  created_at?: string;
  lansia?: {
    nama: string;
  } | null;
}
