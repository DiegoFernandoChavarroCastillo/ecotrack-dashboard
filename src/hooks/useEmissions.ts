import type { NewEmission, UseEmissionsResult } from '../types/emissions'

export function useEmissions(): UseEmissionsResult {
  return {
    emissions: [],
    loading: false,
    error: null,
    addEmission: async (_input: NewEmission) => false,
  }
}
