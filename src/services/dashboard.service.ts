import { supabase } from '../utils/supabase';
import type { Pemeriksaan } from '../types';

export interface DashboardStats {
  totalLansia: number;
  totalPemeriksaan: number;
  normalCount: number;
  waspadaCount: number;
  bahayaCount: number;
}

export const dashboardService = {
  async getDashboardStats(): Promise<DashboardStats> {
    const [lansiaRes, pemeriksaanRes, normalRes, waspadaRes, bahayaRes] = await Promise.all([
      supabase.from('lansia').select('*', { count: 'exact', head: true }),
      supabase.from('pemeriksaan').select('*', { count: 'exact', head: true }),
      supabase.from('pemeriksaan').select('*', { count: 'exact', head: true }).eq('status', 'normal'),
      supabase.from('pemeriksaan').select('*', { count: 'exact', head: true }).eq('status', 'waspada'),
      supabase.from('pemeriksaan').select('*', { count: 'exact', head: true }).eq('status', 'bahaya'),
    ]);

    // Handle errors safely
    if (lansiaRes.error) throw new Error(`Gagal memuat data Lansia: ${lansiaRes.error.message}`);
    if (pemeriksaanRes.error) throw new Error(`Gagal memuat data Pemeriksaan: ${pemeriksaanRes.error.message}`);
    if (normalRes.error) throw new Error(`Gagal memuat status Normal: ${normalRes.error.message}`);
    if (waspadaRes.error) throw new Error(`Gagal memuat status Waspada: ${waspadaRes.error.message}`);
    if (bahayaRes.error) throw new Error(`Gagal memuat status Bahaya: ${bahayaRes.error.message}`);

    return {
      totalLansia: lansiaRes.count ?? 0,
      totalPemeriksaan: pemeriksaanRes.count ?? 0,
      normalCount: normalRes.count ?? 0,
      waspadaCount: waspadaRes.count ?? 0,
      bahayaCount: bahayaRes.count ?? 0,
    };
  },

  async getRecentPemeriksaan(limit: number = 5): Promise<Pemeriksaan[]> {
    const { data, error } = await supabase
      .from('pemeriksaan')
      .select('*, lansia(nama, no_hp_keluarga)')
      .order('tanggal_pemeriksaan', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Gagal memuat riwayat pemeriksaan terbaru: ${error.message}`);
    }

    return (data || []) as any[];
  }
};
