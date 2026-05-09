export function formatAmount(value: number): string {
  if (!Number.isFinite(value)) return '—';
  if (value === 0) return '0';
  const abs = Math.abs(value);
  let maxFrac: number;
  if (abs >= 1000) maxFrac = 2;
  else if (abs >= 1) maxFrac = 4;
  else if (abs >= 0.01) maxFrac = 6;
  else maxFrac = 8;
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxFrac,
  });
}

export function formatUsd(value: number): string {
  if (!Number.isFinite(value)) return '—';
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: value >= 1 ? 2 : 6,
  });
}

export function sanitiseAmountInput(raw: string): string {
  let cleaned = raw.replace(/[^\d.]/g, '');
  const firstDot = cleaned.indexOf('.');
  if (firstDot !== -1) {
    cleaned = cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, '');
  }
  if (/^0\d/.test(cleaned)) cleaned = cleaned.replace(/^0+/, '');
  return cleaned;
}
