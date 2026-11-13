import type { Database } from './database'

type EmissionsTable = Database['public']['Tables']['emissions']

export type Emission = EmissionsTable['Row']
export type EmissionCategory = Database['public']['Enums']['emission_category']
export type NewEmission = Pick<EmissionsTable['Insert'], 'source_name' | 'category' | 'co2_kg'>

export const CATEGORY_LABELS: Record<EmissionCategory, string> = {
  transporte: 'Transporte',
  energia: 'Energía',
  residuos: 'Residuos',
}

export const CATEGORIES = Object.keys(CATEGORY_LABELS) as EmissionCategory[]

export type RequestState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string }

export interface UseEmissionsResult {
  list: RequestState<Emission[]>
  submit: RequestState<Emission>
  addEmission: (input: NewEmission) => Promise<boolean>
  reload: () => Promise<void>
}

export interface EmissionCardProps {
  emission: Emission
}

export interface EmissionFormProps {
  onSubmit: (input: NewEmission) => Promise<boolean>
  submitting: boolean
}
