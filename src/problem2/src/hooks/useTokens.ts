import { useEffect, useState } from 'react';
import { fetchTokens } from '../lib/prices';
import type { Token } from '../lib/types';

interface State {
  tokens: Token[];
  loading: boolean;
  error: string | null;
}

export function useTokens(): State {
  const [state, setState] = useState<State>({
    tokens: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    const ctrl = new AbortController();
    fetchTokens(ctrl.signal)
      .then((tokens) => setState({ tokens, loading: false, error: null }))
      .catch((err: unknown) => {
        if (ctrl.signal.aborted) return;
        const message = err instanceof Error ? err.message : 'Unknown error';
        setState({ tokens: [], loading: false, error: message });
      });
    return () => ctrl.abort();
  }, []);

  return state;
}
