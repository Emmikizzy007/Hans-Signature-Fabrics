export interface CartItem {
  /** Stock keeping unit of the fabric. */
  sku: string;
  /** Price per yard, in minor currency units (kobo). */
  unitPriceMinor: number;
  /** Number of yards ordered. */
  quantity: number;
}

export interface CartTotals {
  subtotalMinor: number;
  discountMinor: number;
  shippingMinor: number;
  totalMinor: number;
}

export interface CartOptions {
  /** Fractional discount between 0 and 1, e.g. 0.1 for 10% off. */
  discountRate?: number;
  /** Flat shipping fee in minor units. */
  shippingMinor?: number;
  /** Subtotal at or above which shipping is waived. */
  freeShippingThresholdMinor?: number;
}

export function subtotal(items: readonly CartItem[]): number {
  return items.reduce((sum, item) => {
    if (!Number.isInteger(item.quantity) || item.quantity < 0) {
      throw new RangeError(`Invalid quantity for sku ${item.sku}`);
    }
    if (!Number.isInteger(item.unitPriceMinor) || item.unitPriceMinor < 0) {
      throw new RangeError(`Invalid unit price for sku ${item.sku}`);
    }
    return sum + item.unitPriceMinor * item.quantity;
  }, 0);
}

export function calculateTotals(
  items: readonly CartItem[],
  options: CartOptions = {},
): CartTotals {
  const {
    discountRate = 0,
    shippingMinor = 0,
    freeShippingThresholdMinor = Infinity,
  } = options;

  if (discountRate < 0 || discountRate > 1) {
    throw new RangeError("discountRate must be between 0 and 1");
  }

  const subtotalMinor = subtotal(items);
  const discountMinor = Math.round(subtotalMinor * discountRate);
  const discounted = subtotalMinor - discountMinor;
  const shipping =
    discounted === 0 || discounted >= freeShippingThresholdMinor
      ? 0
      : shippingMinor;

  return {
    subtotalMinor,
    discountMinor,
    shippingMinor: shipping,
    totalMinor: discounted + shipping,
  };
}

export function mergeItems(items: readonly CartItem[]): CartItem[] {
  const bySku = new Map<string, CartItem>();
  for (const item of items) {
    const existing = bySku.get(item.sku);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      bySku.set(item.sku, { ...item });
    }
  }
  return [...bySku.values()];
}

export function formatNaira(amountMinor: number): string {
  const sign = amountMinor < 0 ? "-" : "";
  const abs = Math.abs(amountMinor);
  const naira = Math.floor(abs / 100);
  const kobo = abs % 100;
  return `${sign}₦${naira.toLocaleString("en-NG")}.${String(kobo).padStart(2, "0")}`;
}
