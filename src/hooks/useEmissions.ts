import { useCallback, useEffect, useRef, useState } from 'react'
import { translateError } from '../lib/errors'
import { supabase } from '../lib/supabase'
import type { Emission, NewEmission, RequestState, UseEmissionsResult } from '../types/emissions'

export function useEmissions(): UseEmissionsResult {
  const [list, setList] = useState<RequestState<Emission[]>>({ status: 'loading' })
  const [submit, setSubmit] = useState<RequestState<Emission>>({ status: 'idle' })

  // Solo la petición más reciente puede escribir la lista: una respuesta lenta y vieja
  // (p. ej. la carga inicial) llegaba después del refresco y borraba la fila recién creada.
  const latestRequest = useRef(0)
  const mounted = useRef(false)
  // Ref y no estado: el estado `submitting` llega en el siguiente render, demasiado tarde
  // para frenar una segunda llamada en el mismo tick.
  const inFlight = useRef(false)
  // Filas optimistas que deben sobrevivir a cualquier recarga que termine antes que su insert.
  const pending = useRef(new Map<string, Emission>())

  const fetchList = useCallback(async () => {
    const requestId = ++latestRequest.current
    const { data, error } = await supabase
      .from('emissions')
      .select('*')
      .order('created_at', { ascending: false })
    if (!mounted.current || requestId !== latestRequest.current) return
    setList(
      error
        ? { status: 'error', error: translateError(error) }
        : { status: 'success', data: [...pending.current.values(), ...data] },
    )
  }, [])

  // Al reintentar se sale del estado de error; si no, el mensaje viejo seguía visible.
  const reload = useCallback(async () => {
    setList((prev) => (prev.status === 'success' ? prev : { status: 'loading' }))
    await fetchList()
  }, [fetchList])

  useEffect(() => {
    mounted.current = true
    void fetchList()
    return () => {
      mounted.current = false
    }
  }, [fetchList])

  const addEmission = useCallback(
    async (input: NewEmission) => {
      if (inFlight.current) return false
      inFlight.current = true

      const tempId = `optimista-${crypto.randomUUID()}`
      const optimistic: Emission = { ...input, id: tempId, created_at: new Date().toISOString() }
      pending.current.set(tempId, optimistic)
      setSubmit({ status: 'loading' })
      setList((prev) => (prev.status === 'success' ? { ...prev, data: [optimistic, ...prev.data] } : prev))

      const { data, error } = await supabase.from('emissions').insert(input).select().single()
      pending.current.delete(tempId)
      inFlight.current = false
      if (!mounted.current) return !error

      if (error) {
        // Se quita solo la fila optimista; restaurar una copia previa pisaría cambios concurrentes.
        setList((prev) =>
          prev.status === 'success' ? { ...prev, data: prev.data.filter((e) => e.id !== tempId) } : prev,
        )
        setSubmit({ status: 'error', error: translateError(error) })
        return false
      }

      setList((prev) =>
        prev.status === 'success' ? { ...prev, data: prev.data.map((e) => (e.id === tempId ? data : e)) } : prev,
      )
      setSubmit({ status: 'success', data })
      void fetchList()
      return true
    },
    [fetchList],
  )

  return { list, submit, addEmission, reload }
}
