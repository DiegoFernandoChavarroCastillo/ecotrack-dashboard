export type EmissionCategory = 'transporte' | 'energia' | 'residuos'

export interface Emission {
  id: string
  source_name: string
  category: EmissionCategory
  co2_kg: number
  created_at: string
}

export type NewEmission = Pick<Emission, 'source_name' | 'category' | 'co2_kg'>

export interface UseEmissionsResult {
  emissions: Emission[]
  loading: boolean
  error: string | null
  addEmission: (input: NewEmission) => Promise<boolean>
}

export interface EmissionCardProps {
  emission: Emission
}

export interface EmissionFormProps {
  onSubmit: (input: NewEmission) => Promise<boolean>
  submitting: boolean
}
