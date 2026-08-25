import { describe, expect, it } from "vitest";
import {
  calculateTotals,
  formatNaira,
  mergeItems,
  subtotal,
  type CartItem,
} from "../src/cart.js";

const wax: CartItem = { sku: "ANK-WAX-01", unitPriceMinor: 450_000, quantity: 2 };
const lace: CartItem = { sku: "ANK-LACE-02", unitPriceMinor: 1_250_000, quantity: 1 };

describe("subtotal", () => {
  it("returns 0 for an empty cart", () => {
    expect(subtotal([])).toBe(0);
  });

  it("sums unit price times quantity across items", () => {
    expect(subtotal([wax, lace])).toBe(2_150_000);
  });

  it("rejects fractional or negative quantities", () => {
    expect(() => subtotal([{ ...wax, quantity: 1.5 }])).toThrow(RangeError);
    expect(() => subtotal([{ ...wax, quantity: -1 }])).toThrow(RangeError);
  });

  it("rejects invalid unit prices", () => {
    expect(() => subtotal([{ ...wax, unitPriceMinor: -1 }])).toThrow(RangeError);
    expect(() => subtotal([{ ...wax, unitPriceMinor: 99.9 }])).toThrow(RangeError);
  });
});

describe("calculateTotals", () => {
  it("defaults to no discount and no shipping", () => {
    expect(calculateTotals([wax])).toEqual({
      subtotalMinor: 900_000,
      discountMinor: 0,
      shippingMinor: 0,
      totalMinor: 900_000,
    });
  });

  it("applies a rounded percentage discount", () => {
    const totals = calculateTotals([{ sku: "x", unitPriceMinor: 333, quantity: 1 }], {
      discountRate: 0.1,
    });
    expect(totals.discountMinor).toBe(33);
    expect(totals.totalMinor).toBe(300);
  });

  it("charges shipping below the free-shipping threshold", () => {
    const totals = calculateTotals([wax], {
      shippingMinor: 250_000,
      freeShippingThresholdMinor: 1_000_000,
    });
    expect(totals.shippingMinor).toBe(250_000);
    expect(totals.totalMinor).toBe(1_150_000);
  });

  it("waives shipping at or above the threshold", () => {
    const totals = calculateTotals([wax, lace], {
      shippingMinor: 250_000,
      freeShippingThresholdMinor: 1_000_000,
    });
    expect(totals.shippingMinor).toBe(0);
    expect(totals.totalMinor).toBe(2_150_000);
  });

  it("does not charge shipping on an empty cart", () => {
    expect(calculateTotals([], { shippingMinor: 250_000 })).toEqual({
      subtotalMinor: 0,
      discountMinor: 0,
      shippingMinor: 0,
      totalMinor: 0,
    });
  });

  it("rejects out-of-range discount rates", () => {
    expect(() => calculateTotals([wax], { discountRate: -0.1 })).toThrow(RangeError);
    expect(() => calculateTotals([wax], { discountRate: 1.5 })).toThrow(RangeError);
  });
});

describe("mergeItems", () => {
  it("combines quantities of duplicate skus without mutating the input", () => {
    const items = [wax, { ...wax, quantity: 3 }, lace];
    expect(mergeItems(items)).toEqual([
      { ...wax, quantity: 5 },
      lace,
    ]);
    expect(wax.quantity).toBe(2);
  });

  it("returns an empty array for an empty cart", () => {
    expect(mergeItems([])).toEqual([]);
  });
});

describe("formatNaira", () => {
  it.each([
    [0, "₦0.00"],
    [5, "₦0.05"],
    [450_000, "₦4,500.00"],
    [-1_234, "-₦12.34"],
  ])("formats %i as %s", (input, expected) => {
    expect(formatNaira(input)).toBe(expected);
  });
});
