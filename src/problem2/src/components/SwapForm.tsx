import { useEffect, useMemo, useState } from 'react';
import { useTokens } from '../hooks/useTokens';
import { formatAmount, formatUsd, sanitiseAmountInput } from '../lib/format';
import type { Token } from '../lib/types';
import { TokenSelect } from './TokenSelect';

type SubmitState =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'success'; from: Token; to: Token; sent: number; received: number };

const DEFAULT_FROM = 'ETH';
const DEFAULT_TO = 'USDC';

export function SwapForm() {
  const { tokens, loading, error } = useTokens();

  const [from, setFrom] = useState<Token | null>(null);
  const [to, setTo] = useState<Token | null>(null);
  const [amount, setAmount] = useState('');
  const [submit, setSubmit] = useState<SubmitState>({ kind: 'idle' });

  useEffect(() => {
    if (!tokens.length) return;
    setFrom((curr) => curr ?? tokens.find((t) => t.symbol === DEFAULT_FROM) ?? tokens[0]);
    setTo((curr) => curr ?? tokens.find((t) => t.symbol === DEFAULT_TO) ?? tokens[1] ?? tokens[0]);
  }, [tokens]);

  const numericAmount = amount === '' ? 0 : Number(amount);

  const validation = useMemo(() => {
    if (amount === '') return { ok: false as const, reason: '' };
    if (!Number.isFinite(numericAmount))
      return { ok: false as const, reason: 'Enter a valid number' };
    if (numericAmount <= 0)
      return { ok: false as const, reason: 'Amount must be greater than zero' };
    if (!from || !to)
      return { ok: false as const, reason: 'Pick both tokens' };
    if (from.symbol === to.symbol)
      return { ok: false as const, reason: 'Source and destination must differ' };
    return { ok: true as const, reason: '' };
  }, [amount, numericAmount, from, to]);

  const rate = from && to ? from.price / to.price : 0;
  const received = validation.ok ? numericAmount * rate : 0;
  const sentUsd = from ? numericAmount * from.price : 0;

  const swapDirection = () => {
    if (!from || !to) return;
    setFrom(to);
    setTo(from);
    setSubmit({ kind: 'idle' });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validation.ok || !from || !to) return;
    setSubmit({ kind: 'submitting' });
    // fake backend call
    await new Promise((r) => setTimeout(r, 1400));
    setSubmit({
      kind: 'success',
      from,
      to,
      sent: numericAmount,
      received,
    });
  };

  const reset = () => {
    setAmount('');
    setSubmit({ kind: 'idle' });
  };

  if (loading) {
    return (
      <div className="card card--state">
        <div className="spinner" aria-hidden="true" />
        <p>Loading tokens…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card card--state">
        <p className="error-message">Couldn't load token prices: {error}</p>
      </div>
    );
  }

  if (submit.kind === 'success') {
    return (
      <div className="card card--success">
        <div className="success-icon" aria-hidden="true">
          <svg viewBox="0 0 32 32" width="40" height="40">
            <circle cx="16" cy="16" r="15" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M10 16.5l4 4 8-9" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2>Swap confirmed</h2>
        <div className="success-detail">
          <div className="success-row">
            <span>Sent</span>
            <strong>
              {formatAmount(submit.sent)} {submit.from.symbol}
            </strong>
          </div>
          <div className="success-row">
            <span>Received</span>
            <strong>
              {formatAmount(submit.received)} {submit.to.symbol}
            </strong>
          </div>
        </div>
        <button type="button" className="btn btn--ghost" onClick={reset}>
          Make another swap
        </button>
      </div>
    );
  }

  return (
    <form className="card" onSubmit={onSubmit} noValidate>
      <header className="card__header">
        <h1>Swap</h1>
        <p>Trade tokens at live market prices</p>
      </header>

      <div className="field">
        <div className="field__label-row">
          <label htmlFor="amount-input">You send</label>
          {from && (
            <span className="field__hint">
              1 {from.symbol} ≈ {formatUsd(from.price)}
            </span>
          )}
        </div>
        <div className="field__row">
          <input
            id="amount-input"
            inputMode="decimal"
            placeholder="0.0"
            value={amount}
            onChange={(e) => {
              setAmount(sanitiseAmountInput(e.target.value));
              if (submit.kind !== 'idle') setSubmit({ kind: 'idle' });
            }}
            autoComplete="off"
          />
          <TokenSelect
            tokens={tokens}
            value={from}
            exclude={to}
            onChange={(t) => setFrom(t)}
            label="source token"
          />
        </div>
        {amount !== '' && (
          <div className="field__usd">≈ {formatUsd(sentUsd)}</div>
        )}
      </div>

      <div className="swap-divider">
        <button
          type="button"
          className="swap-divider__btn"
          onClick={swapDirection}
          aria-label="Swap direction"
          title="Swap direction"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path
              d="M5 3v9m0 0l-3-3m3 3l3-3M13 15V6m0 0l-3 3m3-3l3 3"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <div className="field">
        <div className="field__label-row">
          <label>You receive</label>
          {to && (
            <span className="field__hint">
              1 {to.symbol} ≈ {formatUsd(to.price)}
            </span>
          )}
        </div>
        <div className="field__row field__row--readonly">
          <div className="output-amount">
            {validation.ok ? formatAmount(received) : '0.0'}
          </div>
          <TokenSelect
            tokens={tokens}
            value={to}
            exclude={from}
            onChange={(t) => setTo(t)}
            label="destination token"
          />
        </div>
      </div>

      {from && to && from.symbol !== to.symbol && (
        <div className="rate-line">
          <span>Rate</span>
          <strong>
            1 {from.symbol} = {formatAmount(rate)} {to.symbol}
          </strong>
        </div>
      )}

      {!validation.ok && validation.reason && (
        <div className="error-message" role="alert">
          {validation.reason}
        </div>
      )}

      <button
        type="submit"
        className="btn btn--primary"
        disabled={!validation.ok || submit.kind === 'submitting'}
      >
        {submit.kind === 'submitting' ? (
          <>
            <span className="spinner spinner--sm" aria-hidden="true" />
            Confirming…
          </>
        ) : (
          'Confirm swap'
        )}
      </button>

    </form>
  );
}
