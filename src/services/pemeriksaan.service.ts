import { supabase } from '../utils/supabase';
import { getHealthStatus } from '../utils/health';
import type { Pemeriksaan } from '../types';

export const pemeriksaanService = {
  async getAllPemeriksaan(): Promise<Pemeriksaan[]> {
    const { data, error } = await supabase
      .from('pemeriksaan')
      .select('*, lansia(nama)')
      .order('tanggal_pemeriksaan', { ascending: false });

    if (error) {
      throw new Error(`Gagal memuat data Pemeriksaan: ${error.message}`);
    }
    return (data || []) as Pemeriksaan[];
  },

  async getPemeriksaanById(id: string): Promise<Pemeriksaan> {
    const { data, error } = await supabase
      .from('pemeriksaan')
      .select('*, lansia(nama)')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new Error(`Gagal memuat detail Pemeriksaan: ${error.message}`);
    }
    if (!data) {
      throw new Error('Data Pemeriksaan tidak ditemukan.');
    }
    return data as Pemeriksaan;
  },

  async createPemeriksaan(data: Omit<Pemeriksaan, 'id' | 'status' | 'created_at'>): Promise<Pemeriksaan> {
    const status = getHealthStatus(
      Number(data.tekanan_darah),
      Number(data.gula_darah),
      Number(data.kolesterol)
    );
    const payload = {
      ...data,
      status
    };

    const { data: inserted, error } = await supabase
      .from('pemeriksaan')
      .insert([payload])
      .select()
      .single();

    if (error) {
      throw new Error(`Gagal menambahkan data Pemeriksaan: ${error.message}`);
    }
    return inserted as Pemeriksaan;
  },

  async updatePemeriksaan(id: string, data: Partial<Omit<Pemeriksaan, 'id' | 'status' | 'created_at'>>): Promise<Pemeriksaan> {
    let tekananDarah = data.tekanan_darah;
    let gulaDarah = data.gula_darah;
    let kolesterol = data.kolesterol;

    if (tekananDarah === undefined || gulaDarah === undefined || kolesterol === undefined) {
      const existing = await this.getPemeriksaanById(id);
      if (tekananDarah === undefined) tekananDarah = existing.tekanan_darah;
      if (gulaDarah === undefined) gulaDarah = existing.gula_darah;
      if (kolesterol === undefined) kolesterol = existing.kolesterol;
    }

    const status = getHealthStatus(
      Number(tekananDarah),
      Number(gulaDarah),
      Number(kolesterol)
    );
    const payload = {
      ...data,
      status
    };

    const { data: updated, error } = await supabase
      .from('pemeriksaan')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Gagal memperbarui data Pemeriksaan: ${error.message}`);
    }
    return updated as Pemeriksaan;
  },

  async deletePemeriksaan(id: string): Promise<void> {
    const { error } = await supabase
      .from('pemeriksaan')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Gagal menghapus data Pemeriksaan: ${error.message}`);
    }
  }
};
