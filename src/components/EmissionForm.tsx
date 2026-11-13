import { useState, type FormEvent } from 'react'
import type { EmissionCategory, EmissionFormProps } from '../types/emissions'

export function EmissionForm({ onSubmit, submitting }: EmissionFormProps) {
  const [sourceName, setSourceName] = useState('')
  const [category, setCategory] = useState<EmissionCategory>('transporte')
  const [co2, setCo2] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const ok = await onSubmit({ source_name: sourceName, category, co2_kg: Number(co2) })
    if (ok) {
      setSourceName('')
      setCo2('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <input value={sourceName} onChange={(e) => setSourceName(e.target.value)} placeholder="Fuente" required />
      <select value={category} onChange={(e) => setCategory(e.target.value as EmissionCategory)}>
        <option value="transporte">Transporte</option>
        <option value="energia">Energía</option>
        <option value="residuos">Residuos</option>
      </select>
      <input type="number" step="0.01" min="0" value={co2} onChange={(e) => setCo2(e.target.value)} placeholder="kg CO2" required />
      <button type="submit" disabled={submitting}>Agregar</button>
    </form>
  )
}
