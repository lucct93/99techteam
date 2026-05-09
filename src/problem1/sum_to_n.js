// Task 1: 3 implementations of sum_to_n.
// Brief: input n is integer, result < Number.MAX_SAFE_INTEGER, sum_to_n(5) === 15
// Negative n: sum from n..-1, e.g. sum_to_n(-5) === -15

const normalize = (n) => ({ sign: n < 0 ? -1 : 1, maxNumber: Math.abs(n) });

// iterative
const sum_to_n_a = function (n) {
  const { sign, maxNumber } = normalize(n);
  let total = 0;
  for (let i = 1; i <= maxNumber; i++) total += i;
  return sign * total;
};

// closed form (Gauss)
const sum_to_n_b = function (n) {
  const { sign, maxNumber } = normalize(n);
  return sign * (maxNumber * (maxNumber + 1)) / 2;
};

// functional / reduce
const sum_to_n_c = function (n) {
  const { sign, maxNumber } = normalize(n);
  const numbers = Array.from({ length: maxNumber }, (_, i) => i + 1);
  return sign * numbers.reduce((a, b) => a + b, 0);
};
