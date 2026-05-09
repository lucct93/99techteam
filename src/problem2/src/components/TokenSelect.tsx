import { useEffect, useMemo, useRef, useState } from 'react';
import type { Token } from '../lib/types';
import { TokenIcon } from './TokenIcon';

interface Props {
  tokens: Token[];
  value: Token | null;
  exclude?: Token | null;
  onChange: (t: Token) => void;
  label: string;
}

export function TokenSelect({ tokens, value, exclude, onChange, label }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // close on outside click / Escape
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
    else setQuery('');
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toUpperCase();
    return tokens.filter((t) => {
      if (exclude && t.symbol === exclude.symbol) return false;
      if (!q) return true;
      return t.symbol.toUpperCase().includes(q);
    });
  }, [tokens, query, exclude]);

  return (
    <div className="token-select" ref={rootRef}>
      <button
        type="button"
        className="token-select__trigger"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Select ${label}`}
      >
        {value ? (
          <>
            <TokenIcon symbol={value.symbol} src={value.iconUrl} />
            <span className="token-select__symbol">{value.symbol}</span>
          </>
        ) : (
          <span className="token-select__placeholder">Select token</span>
        )}
        <svg
          className={`token-select__chevron${open ? ' is-open' : ''}`}
          width="12"
          height="12"
          viewBox="0 0 12 12"
          aria-hidden="true"
        >
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="token-select__panel" role="listbox">
          <div className="token-select__search">
            <input
              ref={inputRef}
              type="text"
              placeholder="Search token…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <ul className="token-select__list">
            {filtered.length === 0 ? (
              <li className="token-select__empty">No tokens match</li>
            ) : (
              filtered.map((t) => (
                <li key={t.symbol}>
                  <button
                    type="button"
                    className={`token-select__option${
                      value?.symbol === t.symbol ? ' is-selected' : ''
                    }`}
                    onClick={() => {
                      onChange(t);
                      setOpen(false);
                    }}
                    role="option"
                    aria-selected={value?.symbol === t.symbol}
                  >
                    <TokenIcon symbol={t.symbol} src={t.iconUrl} />
                    <span className="token-select__option-symbol">{t.symbol}</span>
                    <span className="token-select__option-price">
                      ${t.price < 0.01 ? t.price.toFixed(6) : t.price.toFixed(2)}
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
