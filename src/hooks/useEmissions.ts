import { useEffect, useState } from 'react'
import { translateError } from '../lib/errors'
import { supabase } from '../lib/supabase'
import type { Emission, NewEmission, UseEmissionsResult } from '../types/emissions'

export function useEmissions(): UseEmissionsResult {
  const [emissions, setEmissions] = useState<Emission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEmissions = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('emissions')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) setError(translateError(error))
    else setEmissions((data ?? []) as Emission[])
    setLoading(false)
  }

  useEffect(() => {
    fetchEmissions()
  }, [])

  const addEmission = async (input: NewEmission) => {
    const { error } = await supabase.from('emissions').insert(input)
    if (error) {
      setError(translateError(error))
      return false
    }
    await fetchEmissions()
    return true
  }

  return { emissions, loading, error, addEmission }
}
