export type Database = {
  public: {
    Tables: {
      emissions: {
        Row: {
          id: string
          source_name: string
          category: Database['public']['Enums']['emission_category']
          co2_kg: number
          created_at: string
        }
        Insert: {
          id?: string
          source_name: string
          category: Database['public']['Enums']['emission_category']
          co2_kg: number
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['emissions']['Insert']>
        Relationships: []
      }
    }
    Views: Record<never, never>
    Functions: Record<never, never>
    Enums: {
      emission_category: 'transporte' | 'energia' | 'residuos'
    }
    CompositeTypes: Record<never, never>
  }
}
