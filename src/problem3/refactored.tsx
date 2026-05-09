// Refactored WalletPage. Issues are annotated inline in original.tsx.
// `BoxProps`, `useWalletBalances`, `usePrices`, `WalletRow`, `classes`
// are existing project modules referenced in the original snippet, paths
// here are placeholders - this file is read-only reference, not built.
// @ts-nocheck

import { useMemo } from 'react';
import type { BoxProps } from '@mui/material';
import { useWalletBalances } from './hooks/useWalletBalances';
import { usePrices } from './hooks/usePrices';
import { WalletRow } from './WalletRow';
import classes from './WalletPage.module.css';

const SUPPORTED_CHAINS = ['Osmosis', 'Ethereum', 'Arbitrum', 'Zilliqa', 'Neo'] as const;
type SupportedChain = (typeof SUPPORTED_CHAINS)[number];

interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: SupportedChain | string;
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
  usdValue: number;
}

type Props = BoxProps;

const CHAIN_PRIORITY: Record<SupportedChain, number> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
};

const UNSUPPORTED_PRIORITY = -99;

function getPriority(blockchain: string): number {
  return (CHAIN_PRIORITY as Record<string, number | undefined>)[blockchain] ?? UNSUPPORTED_PRIORITY;
}

export const WalletPage: React.FC<Props> = (props) => {
  const balances = useWalletBalances();
  const prices = usePrices();

  // single pass: cache priority, filter, sort, then format + usd value
  const rows = useMemo<FormattedWalletBalance[]>(() => {
    return balances
      .map((balance) => ({ balance, priority: getPriority(balance.blockchain) }))
      .filter(({ balance, priority }) => priority > UNSUPPORTED_PRIORITY && balance.amount > 0)
      .sort((a, b) => b.priority - a.priority)
      .map(({ balance }) => ({
        ...balance,
        formatted: balance.amount.toFixed(2),
        // PROD: prices is in the dep array, so this memo re-runs on every
        // price tick. Fine for a slow feed, but a fast WebSocket feed will
        // cause re-renders multiple times per second. Real fix = throttle
        // or batch price updates upstream (out of scope for this review).
        usdValue: (prices[balance.currency] ?? 0) * balance.amount,
      }));
  }, [balances, prices]);

  return (
    <div {...props}>
      {rows.map((balance) => (
        <WalletRow
          key={balance.currency}
          className={classes.row}
          amount={balance.amount}
          usdValue={balance.usdValue}
          formattedAmount={balance.formatted}
        />
      ))}
    </div>
  );
};
