import type { PriceEntry, Token } from './types';

const PRICES_URL = 'https://interview.switcheo.com/prices.json';
const ICON_BASE = 'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/';

// some token symbols use different casing in the icons repo
const ICON_OVERRIDES: Record<string, string> = {
  STEVMOS: 'stEVMOS',
  STLUNA: 'stLUNA',
  STOSMO: 'stOSMO',
  STATOM: 'stATOM',
  STRD: 'STRD',
  RATOM: 'rATOM',
};

export function iconUrlFor(symbol: string): string {
  const file = ICON_OVERRIDES[symbol] ?? symbol;
  return `${ICON_BASE}${file}.svg`;
}

export async function fetchTokens(signal?: AbortSignal): Promise<Token[]> {
  const res = await fetch(PRICES_URL, { signal });
  if (!res.ok) throw new Error(`Failed to load prices (${res.status})`);
  const entries = (await res.json()) as PriceEntry[];

  // feed has duplicates with different timestamps, keep the latest
  const latest = new Map<string, PriceEntry>();
  for (const e of entries) {
    if (!e.price || e.price <= 0) continue;
    const prev = latest.get(e.currency);
    if (!prev || new Date(e.date) > new Date(prev.date)) {
      latest.set(e.currency, e);
    }
  }

  return [...latest.values()]
    .map<Token>((e) => ({
      symbol: e.currency,
      price: e.price,
      iconUrl: iconUrlFor(e.currency),
    }))
    .sort((a, b) => a.symbol.localeCompare(b.symbol));
}
