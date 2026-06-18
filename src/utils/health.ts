/**
 * Calculates the health risk status of a senior based on blood pressure, blood sugar, and cholesterol levels.
 *
 * Rules:
 * - Bahaya: tekanan_darah >= 160 OR gula_darah >= 200 OR kolesterol >= 240
 * - Waspada: tekanan_darah >= 140 OR gula_darah >= 140 OR kolesterol >= 200
 * - Normal: All values below thresholds
 */
export function getHealthStatus(
  tekananDarah: number,
  gulaDarah: number,
  kolesterol: number
): 'normal' | 'waspada' | 'bahaya' {
  if (tekananDarah >= 160 || gulaDarah >= 200 || kolesterol >= 240) {
    return 'bahaya';
  }
  if (tekananDarah >= 140 || gulaDarah >= 140 || kolesterol >= 200) {
    return 'waspada';
  }
  return 'normal';
}
