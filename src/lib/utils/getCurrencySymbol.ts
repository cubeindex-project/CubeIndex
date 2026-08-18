export function getCurrencySymbol(currencyCode?: string) {
  if (!currencyCode) return;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
    currencyDisplay: "symbol",
  })
    .formatToParts(0)
    .find((part) => part.type === "currency")?.value;
}
