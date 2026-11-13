import { useCallback, useId, useState, type ChangeEvent, type FormEvent } from 'react'
import { CATEGORIES, CATEGORY_LABELS, type EmissionCategory, type EmissionFormProps } from '../types/emissions'

const FIELD =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus-visible:border-emerald-600 focus-visible:ring-2 focus-visible:ring-emerald-600'

function isCategory(value: string): value is EmissionCategory {
  return (CATEGORIES as readonly string[]).includes(value)
}

export function EmissionForm({ onSubmit, submitting }: EmissionFormProps) {
  const id = useId()
  const [sourceName, setSourceName] = useState('')
  const [category, setCategory] = useState<EmissionCategory>('transporte')
  const [co2, setCo2] = useState('')
  const [validation, setValidation] = useState<string | null>(null)

  const handleName = useCallback((e: ChangeEvent<HTMLInputElement>) => setSourceName(e.target.value), [])
  const handleCo2 = useCallback((e: ChangeEvent<HTMLInputElement>) => setCo2(e.target.value), [])
  const handleCategory = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    if (isCategory(e.target.value)) setCategory(e.target.value)
  }, [])

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      const name = sourceName.trim()
      const amount = Number(co2)
      if (!name) return setValidation('Escribe el nombre de la fuente.')
      if (co2 === '' || !Number.isFinite(amount) || amount < 0) {
        return setValidation('El CO₂ debe ser un número mayor o igual a 0.')
      }
      setValidation(null)
      const ok = await onSubmit({ source_name: name, category, co2_kg: amount })
      if (ok) {
        setSourceName('')
        setCo2('')
      }
    },
    [sourceName, category, co2, onSubmit],
  )

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_auto] lg:items-end"
    >
      <div className="flex flex-col gap-1">
        <label htmlFor={`${id}-name`} className="text-sm font-medium text-slate-700">
          Fuente
        </label>
        <input
          id={`${id}-name`}
          value={sourceName}
          onChange={handleName}
          placeholder="Ej. Flota de reparto"
          autoComplete="off"
          required
          className={FIELD}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor={`${id}-category`} className="text-sm font-medium text-slate-700">
          Categoría
        </label>
        <select id={`${id}-category`} value={category} onChange={handleCategory} className={FIELD}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABELS[c]}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor={`${id}-co2`} className="text-sm font-medium text-slate-700">
          CO₂ (kg)
        </label>
        <input
          id={`${id}-co2`}
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          value={co2}
          onChange={handleCo2}
          placeholder="0,00"
          required
          className={FIELD}
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg bg-emerald-700 px-4 py-2 font-semibold text-white hover:bg-emerald-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? 'Guardando…' : 'Agregar'}
      </button>
      <p aria-live="polite" className="text-sm text-red-700 empty:hidden sm:col-span-2 lg:col-span-4">
        {validation}
      </p>
    </form>
  )
}
