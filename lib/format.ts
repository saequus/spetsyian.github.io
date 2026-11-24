/** "2025-12-09" -> "9 December 2025" (stable across server/client). */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ]
  return `${d} ${months[m - 1]} ${y}`
}
