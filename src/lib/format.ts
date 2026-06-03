export function formatNGN(n: number | string | null | undefined): string {
  if (n === null || n === undefined) return '\u20A60.00';
  const num = typeof n === 'string' ? Number(n) : n;
  if (Number.isNaN(num)) return '\u20A60.00';
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

export function formatDate(d: string | Date | null | undefined): string {
  if (!d) return '\u2014';
  const date = typeof d === 'string' ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return '\u2014';
  return date.toLocaleString('en-GB', {
    year: 'numeric', month: 'short', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}

export function formatDateShort(d: string | Date | null | undefined): string {
  if (!d) return '\u2014';
  const date = typeof d === 'string' ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return '\u2014';
  return date.toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: '2-digit' });
}
