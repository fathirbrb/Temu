import { supabase } from '../utils/supabase';
import type { Lansia } from '../types';

export const lansiaService = {
  async getAllLansia(): Promise<Lansia[]> {
    const { data, error } = await supabase
      .from('lansia')
      .select('*')
      .order('nama', { ascending: true });

    if (error) {
      throw new Error(`Gagal memuat data Lansia: ${error.message}`);
    }
    return (data || []) as Lansia[];
  },

  async getLansiaById(id: string): Promise<Lansia> {
    const { data, error } = await supabase
      .from('lansia')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new Error(`Gagal memuat detail Lansia: ${error.message}`);
    }
    if (!data) {
      throw new Error('Data Lansia tidak ditemukan.');
    }
    return data as Lansia;
  },

  async createLansia(data: Omit<Lansia, 'id' | 'created_at'>): Promise<Lansia> {
    const { data: inserted, error } = await supabase
      .from('lansia')
      .insert([data])
      .select()
      .single();

    if (error) {
      throw new Error(`Gagal menambahkan data Lansia: ${error.message}`);
    }
    return inserted as Lansia;
  },

  async updateLansia(id: string, data: Partial<Omit<Lansia, 'id' | 'created_at'>>): Promise<Lansia> {
    const { data: updated, error } = await supabase
      .from('lansia')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Gagal memperbarui data Lansia: ${error.message}`);
    }
    return updated as Lansia;
  },

  async deleteLansia(id: string): Promise<void> {
    const { error } = await supabase
      .from('lansia')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Gagal menghapus data Lansia: ${error.message}`);
    }
  }
};
