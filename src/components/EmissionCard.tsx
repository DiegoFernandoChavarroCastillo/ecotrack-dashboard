import { memo } from 'react'
import { CATEGORY_LABELS, type EmissionCardProps, type EmissionCategory } from '../types/emissions'

const BADGE: Record<EmissionCategory, string> = {
  transporte: 'bg-sky-100 text-sky-800',
  energia: 'bg-amber-100 text-amber-800',
  residuos: 'bg-emerald-100 text-emerald-800',
}

const kg = new Intl.NumberFormat('es', { maximumFractionDigits: 2 })
const date = new Intl.DateTimeFormat('es', { dateStyle: 'medium', timeStyle: 'short' })

export const EmissionCard = memo(function EmissionCard({ emission }: EmissionCardProps) {
  return (
    <li className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-slate-900">{emission.source_name}</h3>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${BADGE[emission.category]}`}>
          {CATEGORY_LABELS[emission.category]}
        </span>
      </div>
      <p className="text-3xl font-bold tabular-nums text-slate-900">
        {kg.format(emission.co2_kg)} <span className="text-base font-medium text-slate-500">kg CO₂</span>
      </p>
      <time dateTime={emission.created_at} className="text-xs text-slate-500">
        {date.format(new Date(emission.created_at))}
      </time>
    </li>
  )
})
