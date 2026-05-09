import { useState } from 'react';

interface Props {
  symbol: string;
  src: string;
  size?: number;
}

// fallback to a colored chip if the icon doesn't exist in the repo
export function TokenIcon({ symbol, src, size = 28 }: Props) {
  const [errored, setErrored] = useState(false);

  if (errored) {
    return (
      <span
        className="token-fallback"
        style={{ width: size, height: size, fontSize: size * 0.42 }}
        aria-hidden="true"
      >
        {symbol.slice(0, 3)}
      </span>
    );
  }

  return (
    <img
      className="token-icon"
      src={src}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      onError={() => setErrored(true)}
    />
  );
}
