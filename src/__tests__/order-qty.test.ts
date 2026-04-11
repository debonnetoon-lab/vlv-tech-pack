import { describe, it, expect } from 'vitest';
import { calculateTotalOrderQty, sanitizeQuantity } from '../lib/order-utils';

describe('Order Quantity Calculations', () => {
    
    it('should return 0 for an empty grid/null input', () => {
        expect(calculateTotalOrderQty(null)).toBe(0);
        expect(calculateTotalOrderQty([])).toBe(0);
    });

    it('should calculate total for a single size', () => {
        const sizes = [{ size_label: 'M', order_quantity: 50 }];
        expect(calculateTotalOrderQty(sizes)).toBe(50);
    });

    it('should calculate total for multiple sizes correctly', () => {
        const sizes = [
            { size_label: 'S', order_quantity: 10 },
            { size_label: 'M', order_quantity: 20 },
            { size_label: 'L', order_quantity: 30 }
        ];
        expect(calculateTotalOrderQty(sizes)).toBe(60);
    });

    it('should handle non-numeric input gracefully (NaN/undefined)', () => {
        const sizes = [
            { size_label: 'S', order_quantity: 'abc' as any },
            { size_label: 'M', order_quantity: undefined as any },
            { size_label: 'L', order_quantity: 25 }
        ];
        expect(calculateTotalOrderQty(sizes)).toBe(25);
    });

    it('should prevent and correct negative values to 0', () => {
        const sizes = [
            { size_label: 'S', order_quantity: -10 },
            { size_label: 'M', order_quantity: 5 }
        ];
        expect(calculateTotalOrderQty(sizes)).toBe(5);
        expect(sanitizeQuantity(-10)).toBe(0);
    });

    it('should handle overflow or large values correctly', () => {
        const sizes = [
            { size_label: 'XS', order_quantity: 1000000 },
            { size_label: 'S', order_quantity: 500000 }
        ];
        expect(calculateTotalOrderQty(sizes)).toBe(1500000);
    });

    it('should sanitize fractional numbers to integers', () => {
        expect(sanitizeQuantity(10.7)).toBe(10);
        expect(sanitizeQuantity("15.2")).toBe(15);
    });
});
