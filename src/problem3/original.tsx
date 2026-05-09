// Original snippet from the brief with inline issue annotations.
// See ISSUES.txt for the full review and refactored.tsx for the fix.
// @ts-nocheck
/* eslint-disable */

interface WalletBalance {
  currency: string;
  amount: number;
  // ISSUE #9: missing `blockchain` field that the code below reads.
}
interface FormattedWalletBalance {
  currency: string;
  amount: number;
  formatted: string;
}

// ISSUE #12: empty interface extension - use `type Props = BoxProps` instead.
interface Props extends BoxProps {}

const WalletPage: React.FC<Props> = (props: Props) => {
  // ISSUE #11: `children` is destructured out of props but never rendered,
  // so any children passed by the caller are silently dropped.
  const { children, ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();

  // ISSUE #8: `getPriority` is recreated on every render and uses `any`.
  // It is pure and has no closure deps, so it should live at module scope
  // and be typed against a literal union of supported chains.
  const getPriority = (blockchain: any): number => {
    switch (blockchain) {
      case 'Osmosis':
        return 100;
      case 'Ethereum':
        return 50;
      case 'Arbitrum':
        return 30;
      case 'Zilliqa':
        return 20;
      case 'Neo':
        return 20;
      default:
        return -99;
    }
  };

  const sortedBalances = useMemo(() => {
    return balances
      .filter((balance: WalletBalance) => {
        const balancePriority = getPriority(balance.blockchain);
        // ISSUE #1: `lhsPriority` is undefined - it should be `balancePriority`.
        // This throws a ReferenceError on the first render.
        if (lhsPriority > -99) {
          // ISSUE #2: filter logic is inverted - keeps balances with
          // amount <= 0 and drops positive ones. A wallet UI should show
          // balances the user actually has.
          if (balance.amount <= 0) {
            return true;
          }
        }
        return false;
      })
      .sort((lhs: WalletBalance, rhs: WalletBalance) => {
        // ISSUE #5: getPriority runs twice per compare - O(n log n)
        // redundant switch evaluations. Cache priority once per balance
        // (decorate-sort-undecorate) instead.
        const leftPriority = getPriority(lhs.blockchain);
        const rightPriority = getPriority(rhs.blockchain);
        if (leftPriority > rightPriority) {
          return -1;
        } else if (rightPriority > leftPriority) {
          return 1;
        }
        // ISSUE #3: comparator falls off the end and returns undefined
        // when priorities are equal - undefined behaviour per spec.
      });
    // ISSUE #4: `prices` is in the dep array but the callback never reads
    // it - memo invalidates on every price tick.
  }, [balances, prices]);

  // ISSUE #6: `formattedBalances` is built then never used. The rows map
  // below reads from `sortedBalances` (which is WalletBalance[], not
  // FormattedWalletBalance[]) and tries to read `balance.formatted` from
  // objects that don't have that field.
  const formattedBalances = sortedBalances.map((balance: WalletBalance) => {
    return {
      ...balance,
      formatted: balance.amount.toFixed(),
    };
  });

  // ISSUE #10: the entire rows array is rebuilt on every render. Combine
  // sort + format + usd into a single useMemo keyed on [balances, prices].
  const rows = sortedBalances.map(
    // ISSUE #9 (cont.): casting to FormattedWalletBalance here is a lie -
    // sortedBalances elements are WalletBalance, so balance.formatted is
    // undefined at runtime.
    (balance: FormattedWalletBalance, index: number) => {
      // ISSUE #13: prices[currency] is looked up on every render. Snapshot
      // the price inside the memo so usd values don't flicker mid-frame.
      
      // BUSSINESS ISSUE: snapshot alone is not enough on a fast feed - the memo still
      // re-runs on every price tick. Real fix = throttle / batch price
      // updates upstream (out of scope for this review).
      const usdValue = prices[balance.currency] * balance.amount;
      return (
        <WalletRow
          className={classes.row}
          // ISSUE #7: key={index} is an anti-pattern for sortable lists -
          // when order changes, React reuses the wrong DOM nodes.
          // Use key={balance.currency} instead.
          key={index}
          amount={balance.amount}
          usdValue={usdValue}
          formattedAmount={balance.formatted}
        />
      );
    }
  );

  return <div {...rest}>{rows}</div>;
};
