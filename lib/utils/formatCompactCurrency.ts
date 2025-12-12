export function formatCompactCurrency(value: number) {
  if (!Number.isFinite(value)) return "$0";

  const abs = Math.abs(value);
  const maximumFractionDigits = abs >= 1_000_000 ? 1 : abs >= 100_000 ? 0 : 1;
  const minimumFractionDigits = abs >= 1_000_000 ? 1 : 0;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits,
    minimumFractionDigits
  }).format(value);
}
