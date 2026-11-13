import type { EmissionCardProps } from '../types/emissions'

export function EmissionCard({ emission }: EmissionCardProps) {
  return <li>{emission.source_name}</li>
}
