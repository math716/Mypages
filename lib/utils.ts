import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

// Função para parsear data de string YYYY-MM-DD ou Date sem problemas de timezone
export function parseLocalDate(dateInput: string | Date): Date {
  if (dateInput instanceof Date) {
    // Se já é Date, extrair os componentes e criar nova data local
    const str = dateInput.toISOString().split('T')[0]
    const [year, month, day] = str.split('-').map(Number)
    return new Date(year, month - 1, day, 12, 0, 0) // Meio-dia para evitar problemas
  }
  // Se é string no formato YYYY-MM-DD
  const [year, month, day] = dateInput.split('-').map(Number)
  return new Date(year, month - 1, day, 12, 0, 0)
}

// Formatar data para exibição em pt-BR
export function formatDateBR(dateInput: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const date = parseLocalDate(dateInput)
  return date.toLocaleDateString('pt-BR', options || { day: '2-digit', month: '2-digit', year: 'numeric' })
}

// Formatar data curta (dd/mm)
export function formatDateShort(dateInput: string | Date): string {
  const date = parseLocalDate(dateInput)
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

// Obter data atual no formato YYYY-MM-DD
export function getTodayString(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}