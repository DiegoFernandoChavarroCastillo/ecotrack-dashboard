import { useEmissions } from '../hooks/useEmissions'
import { EmissionCard } from './EmissionCard'
import { EmissionForm } from './EmissionForm'

export function EmissionsTracker() {
  const { emissions, loading, error, addEmission } = useEmissions()

  return (
    <main className="mx-auto max-w-3xl p-4">
      <h1 className="mb-4 text-2xl font-bold">EcoTrack</h1>
      <EmissionForm onSubmit={addEmission} submitting={loading} />
      {error && <p className="text-red-600">{error}</p>}
      {loading ? (
        <p>Cargando…</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-2">
          {emissions.map((e) => (
            <EmissionCard key={e.id} emission={e} />
          ))}
        </ul>
      )}
    </main>
  )
}
