import type { PostgrestError } from '@supabase/supabase-js'

const MESSAGES: Record<string, string> = {
  '23502': 'Falta un campo obligatorio.',
  '23514': 'El valor no cumple las reglas de la tabla.',
  '22P02': 'Algún dato tiene un formato no válido (revisa la categoría).',
  '22003': 'El valor de CO2 es demasiado grande.',
  '42501': 'No tienes permiso para esta operación (revisa las políticas RLS).',
  '42P01': 'La tabla de emisiones no existe en la base de datos.',
  PGRST301: 'La sesión no es válida. Revisa la clave de Supabase.',
}

// supabase-js no lanza en errores de red: los devuelve con code vacío y el mensaje del fetch.
export function translateError(error: PostgrestError): string {
  if (MESSAGES[error.code]) return MESSAGES[error.code]
  if (/fetch|network/i.test(error.message)) return 'No hay conexión con el servidor. Inténtalo de nuevo.'
  return 'Ocurrió un error inesperado al comunicarse con la base de datos.'
}
