/** Clamps a number between a min and max bound. @example clamp(150, 0, 100) // 100 */
export const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

/** Rounds a number to the given decimal places. @example round(1.005, 2) // 1.01 */
export const round = (value: number, decimals = 2): number =>
  Number(Math.round(Number(value + "e" + decimals)) + "e-" + decimals);

/** Formats a number as a localised currency string. @example formatCurrency(1999.9) // '$1,999.90' */
export const formatCurrency = (
  value: number,
  currency = "USD",
  locale = "en-US",
): string =>
  new Intl.NumberFormat(locale, { style: "currency", currency }).format(value);

/** Formats a number with thousand separators. @example formatNumber(10000) // '10,000' */
export const formatNumber = (value: number, locale = "en-US"): string =>
  new Intl.NumberFormat(locale).format(value);

/** Formats a decimal as a percentage string. @example formatPercent(0.175) // '17.5%' */
export const formatPercent = (value: number, decimals = 1): string =>
  `${round(value * 100, decimals)}%`;

/** Returns true if the value can be parsed as a finite number. @example isNumeric('42') // true */
export const isNumeric = (value: unknown): boolean =>
  !isNaN(parseFloat(String(value))) && isFinite(Number(value));
