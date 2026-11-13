import { useEmissions } from '../hooks/useEmissions'
import { EmissionCard } from './EmissionCard'
import { EmissionForm } from './EmissionForm'

export function EmissionsTracker() {
  const { emissions, loading, addEmission } = useEmissions()

  return (
    <main>
      <h1>EcoTrack</h1>
      <EmissionForm onSubmit={addEmission} submitting={loading} />
      <ul>
        {emissions.map((e) => (
          <EmissionCard key={e.id} emission={e} />
        ))}
      </ul>
    </main>
  )
}
