import { useMemo } from 'react'
import { useEmissions } from '../hooks/useEmissions'
import { CATEGORIES, CATEGORY_LABELS, type Emission, type EmissionCategory } from '../types/emissions'
import { EmissionCard } from './EmissionCard'
import { EmissionForm } from './EmissionForm'

// Referencia estable: un [] literal nuevo en cada render invalidaría los useMemo.
const EMPTY: Emission[] = []
const kg = new Intl.NumberFormat('es', { maximumFractionDigits: 2 })
const GRID = 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'
const FOCUS = 'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2'

export function EmissionsTracker() {
  const { list, submit, addEmission, reload } = useEmissions()
  const emissions = list.status === 'success' ? list.data : EMPTY
  const isLoading = list.status === 'loading'

  const total = useMemo(() => emissions.reduce((sum, e) => sum + e.co2_kg, 0), [emissions])
  const byCategory = useMemo(() => {
    const acc: Record<EmissionCategory, number> = { transporte: 0, energia: 0, residuos: 0 }
    for (const e of emissions) acc[e.category] += e.co2_kg
    return acc
  }, [emissions])

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8">
        <header className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-slate-900">EcoTrack</h1>
          <p className="text-slate-600">Registro de emisiones de CO₂ por fuente.</p>
        </header>

        <section aria-labelledby="resumen" aria-busy={isLoading}>
          <h2 id="resumen" className="sr-only">
            Resumen
          </h2>
          <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <div className="col-span-2 rounded-xl bg-emerald-800 p-4 text-white lg:col-span-1">
              <dt className="text-sm text-emerald-100">Total</dt>
              <dd className="text-2xl font-bold tabular-nums">{list.status !== 'success' ? '—' : `${kg.format(total)} kg`}</dd>
            </div>
            {CATEGORIES.map((c) => (
              <div key={c} className="rounded-xl border border-slate-200 bg-white p-4">
                <dt className="text-sm text-slate-600">{CATEGORY_LABELS[c]}</dt>
                <dd className="text-2xl font-bold tabular-nums text-slate-900">{list.status !== 'success' ? '—' : `${kg.format(byCategory[c])} kg`}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="nueva" className="flex flex-col gap-3">
          <h2 id="nueva" className="text-lg font-semibold text-slate-900">
            Nueva medición
          </h2>
          <EmissionForm onSubmit={addEmission} submitting={submit.status === 'loading'} />
          <div aria-live="polite">
            {submit.status === 'error' && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800">{submit.error}</p>
            )}
            {submit.status === 'success' && (
              <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800">
                Medición «{submit.data.source_name}» guardada.
              </p>
            )}
          </div>
        </section>

        <section aria-labelledby="mediciones" aria-busy={isLoading} className="flex flex-col gap-3">
          <h2 id="mediciones" className="text-lg font-semibold text-slate-900">
            Mediciones
          </h2>
          <div aria-live="polite">
            {isLoading && <p className="sr-only">Cargando mediciones…</p>}
            {list.status === 'error' && (
              <div className="flex flex-col items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-5 text-red-800">
                <p>{list.error}</p>
                <button
                  type="button"
                  onClick={reload}
                  className={`rounded-lg border border-red-300 bg-white px-3 py-1.5 font-medium hover:bg-red-100 focus-visible:ring-red-600 ${FOCUS}`}
                >
                  Reintentar
                </button>
              </div>
            )}
            {list.status === 'success' && emissions.length === 0 && (
              <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
                Aún no hay mediciones. Agrega la primera con el formulario.
              </p>
            )}
          </div>
          {isLoading && (
            <ul className={GRID} aria-hidden="true">
              {Array.from({ length: 6 }, (_, i) => (
                <li key={i} className="h-36 animate-pulse rounded-xl bg-slate-200" />
              ))}
            </ul>
          )}
          {emissions.length > 0 && (
            <ul className={GRID}>
              {emissions.map((e) => (
                <EmissionCard key={e.id} emission={e} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  )
}
