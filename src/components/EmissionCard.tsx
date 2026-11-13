import type { EmissionCardProps } from '../types/emissions'

export function EmissionCard({ emission }: EmissionCardProps) {
  return (
    <li className="rounded-lg border border-slate-200 p-4">
      <p className="font-semibold">{emission.source_name}</p>
      <p className="text-sm text-slate-600">{emission.category}</p>
      <p>{emission.co2_kg} kg CO2</p>
    </li>
  )
}
