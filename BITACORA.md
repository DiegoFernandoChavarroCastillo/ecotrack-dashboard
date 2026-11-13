# Bitácora Spec-to-Code — EcoTrack Dashboard

Stack: React 18 + TypeScript estricto + Vite + Tailwind CSS v4 + Supabase (`public.emissions`).
Repo: https://github.com/DiegoFernandoChavarroCastillo/ecotrack-dashboard

| # | Commit | SHA |
|---|--------|-----|
| 1 | feat: estructura y tipos (prompt 1) | `5c29d2e` |
| 2 | feat: hook useEmissions con loading y error (prompt 2) | `db224a8` |
| 3 | refactor: TS estricto, accesibilidad y memo (prompt 3) | `f4d25c3` |
| 4 | fix: respuesta obsoleta sobrescribía la lista y doble envío en useEmissions (prompt 4) | `3bcf172` |

---

## Iteración 1 — Estructura

**Prompt:**
> Define el árbol de archivos (máx. 3 niveles), la responsabilidad de cada uno en una línea y las interfaces TypeScript de props y del retorno del hook. Crea los archivos con esas firmas, aún sin implementar la lógica.

**Qué cambió:** proyecto Vite + React 18 + Tailwind v4, `strict: true` en tsconfig y árbol de carpetas por responsabilidad. El hook devuelve un stub tipado para que el build pase sin lógica.

```
src/
├─ lib/supabase.ts            cliente Supabase único
├─ types/emissions.ts         tipos de dominio, props y retorno del hook
├─ hooks/useEmissions.ts      toda la lógica de datos (carga, inserción, estado)
└─ components/
   ├─ EmissionsTracker.tsx    contenedor: resumen, formulario y lista
   ├─ EmissionForm.tsx        formulario controlado de nueva medición
   └─ EmissionCard.tsx        tarjeta de una medición
```
```ts
export interface UseEmissionsResult {
  emissions: Emission[]; loading: boolean; error: string | null
  addEmission: (input: NewEmission) => Promise<boolean>
}
```

Commit: https://github.com/DiegoFernandoChavarroCastillo/ecotrack-dashboard/commit/5c29d2e

---

## Iteración 2 — Lógica

**Prompt:**
> Implementa lib/supabase.ts y useEmissions.ts: estados loading, error y data; carga inicial en useEffect; addEmission que inserta y refresca; errores de Supabase traducidos a mensajes en español, nunca el objeto crudo. Añade una UI mínima que ya funcione.

**Qué cambió:** el cliente valida las variables de entorno. El hook carga en `useEffect`, inserta y vuelve a consultar. `lib/errors.ts` traduce códigos de Postgres/PostgREST (`23502`, `22P02`, `42501`…) y errores de red a mensajes en español.

```ts
const addEmission = async (input: NewEmission) => {
  const { error } = await supabase.from('emissions').insert(input)
  if (error) { setError(translateError(error)); return false }
  await fetchEmissions()
  return true
}
```

Diff: https://github.com/DiegoFernandoChavarroCastillo/ecotrack-dashboard/compare/5c29d2e...db224a8

---

## Iteración 3 — Refinamiento

**Prompt:**
> - TypeScript estricto: cero any, discriminated union para el estado de la petición, tipos derivados del esquema de la tabla.
> - Accesibilidad: cada input con `<label>` asociado, aria-live="polite" en los mensajes, aria-busy durante la carga, foco visible y operable por teclado.
> - Rendimiento: useMemo para el total de CO2 y el agrupado por categoría, useCallback en los handlers, key estable en la lista.
> - Tailwind: grid de 1 columna en móvil, 2 en tablet y 3 en escritorio; skeleton de carga, estado vacío, mensaje de error visible y botón deshabilitado mientras guarda.

**Qué cambió:** `types/database.ts` modela el esquema y `createClient<Database>` infiere las filas, así que desaparece el cast `as Emission[]`. El estado pasa de tres `useState` sueltos a `RequestState<T>`. Se añaden labels con `useId`, `aria-live`, `aria-busy`, `focus-visible`, `memo` en la tarjeta y un grid 1/2/3 con skeleton, estado vacío y botón «Reintentar».

```ts
export type Emission = Database['public']['Tables']['emissions']['Row']
export type RequestState<T> =
  | { status: 'idle' } | { status: 'loading' }
  | { status: 'success'; data: T } | { status: 'error'; error: string }
```
```tsx
const total = useMemo(() => emissions.reduce((s, e) => s + e.co2_kg, 0), [emissions])
<section aria-busy={isLoading}> … <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
```

Diff: https://github.com/DiegoFernandoChavarroCastillo/ecotrack-dashboard/compare/db224a8...f4d25c3

---

## Iteración 4 — Corrección de un fallo real

**Prompt:**
> Ejecuta `npm run build` y revisa el código en busca de un defecto auténtico de concurrencia o de estado: doble envío al hacer clic dos veces, formulario que no se limpia, error anterior que persiste al reintentar, o setState después de desmontar. Corrígelo DENTRO del hook, no en el componente, y añade actualización optimista que revierta la lista si el insert falla. Documenta cuál era el fallo y por qué ocurría.

**El fallo:** `reload()` escribía en la lista sin comprobar si su respuesta seguía siendo la más reciente. Con la carga inicial lenta (arranque en frío de Supabase, red móvil), si el usuario guardaba una medición, el insert y su refresco terminaban antes. Luego llegaba la respuesta de la carga inicial, con datos anteriores al insert, y **sobrescribía la lista**: la tarjeta nueva desaparecía y el total quedaba mal. La causa es que las promesas no se resuelven en el orden en que se lanzan y el último `setList` gana. En la misma revisión aparecieron tres defectos más:
- **Doble envío:** la única barrera era `disabled`, que depende de un re-render; dos llamadas en el mismo tick insertaban dos filas.
- **Error persistente:** reintentar no salía del estado `error`.
- **setState tras desmontar:** se escribía estado después del unmount.

**Corrección (solo en el hook):**
- Contador `latestRequest`: solo escribe la lista la petición más reciente.
- `mounted` descarta las respuestas que llegan tras desmontar.
- `inFlight` (ref, síncrono) bloquea el doble envío.
- `reload` vuelve a `loading` antes de reintentar.
- Inserción optimista con id temporal: si falla, se quita solo esa fila, en vez de restaurar una copia que pisaría cambios concurrentes.
- `pending` conserva las filas optimistas aunque una recarga termine antes que su insert.

```ts
const requestId = ++latestRequest.current
const { data, error } = await supabase.from('emissions').select('*').order('created_at', { ascending: false })
if (!mounted.current || requestId !== latestRequest.current) return
```
```ts
if (inFlight.current) return false
inFlight.current = true
setList((p) => (p.status === 'success' ? { ...p, data: [optimistic, ...p.data] } : p))
// si el insert falla:
setList((p) => (p.status === 'success' ? { ...p, data: p.data.filter((e) => e.id !== tempId) } : p))
```

Diff: https://github.com/DiegoFernandoChavarroCastillo/ecotrack-dashboard/compare/f4d25c3...3bcf172

---

## Rúbrica × evidencia

| Criterio | Evidencia concreta |
|---|---|
| Prompteo iterativo | 4 prompts en orden, cada uno con su commit (`5c29d2e` → `db224a8` → `f4d25c3` → `3bcf172`) y su enlace de diff. Cada iteración parte del código de la anterior: el stub tipado de la 1 se implementa en la 2, se tipa con el esquema en la 3 y se corrige en la 4. |
| Ejecución técnica React + Supabase | Ningún componente importa Supabase; todo pasa por `useEmissions`. El cliente está tipado con `createClient<Database>`, los errores se traducen en `lib/errors.ts` y el estado usa la unión discriminada `RequestState<T>`. Hay control de carreras (`latestRequest`), guarda síncrona `inFlight` e insert optimista con reversión. `npm run build` y `oxlint` pasan sin errores ni warnings, y no hay ningún `any`. |
| Calidad de UI | Grid `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`, skeleton `animate-pulse`, estado vacío, error con «Reintentar», botón «Guardando…» deshabilitado y resumen con total y desglose por categoría (`useMemo`). Cada input tiene `<label htmlFor>` (`useId`); hay `aria-live="polite"`, `aria-busy`, `focus-visible:ring` y todo el texto está en español. |
