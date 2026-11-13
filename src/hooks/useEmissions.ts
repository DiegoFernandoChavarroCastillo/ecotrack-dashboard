import { useCallback, useEffect, useState } from 'react'
import { translateError } from '../lib/errors'
import { supabase } from '../lib/supabase'
import type { Emission, NewEmission, RequestState, UseEmissionsResult } from '../types/emissions'

export function useEmissions(): UseEmissionsResult {
  const [list, setList] = useState<RequestState<Emission[]>>({ status: 'loading' })
  const [submit, setSubmit] = useState<RequestState<Emission>>({ status: 'idle' })

  const reload = useCallback(async () => {
    const { data, error } = await supabase
      .from('emissions')
      .select('*')
      .order('created_at', { ascending: false })
    setList(error ? { status: 'error', error: translateError(error) } : { status: 'success', data })
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  const addEmission = useCallback(
    async (input: NewEmission) => {
      setSubmit({ status: 'loading' })
      const { data, error } = await supabase.from('emissions').insert(input).select().single()
      if (error) {
        setSubmit({ status: 'error', error: translateError(error) })
        return false
      }
      setSubmit({ status: 'success', data })
      await reload()
      return true
    },
    [reload],
  )

  return { list, submit, addEmission, reload }
}
