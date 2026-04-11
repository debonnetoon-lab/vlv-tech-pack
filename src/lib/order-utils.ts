/**
 * Utility functions for Order Quantity calculations.
 * Used to ensure industrial accuracy in tech pack production.
 */

export interface OrderSize {
    size_label: string;
    order_quantity: number | string;
}

/**
 * Calculates the total sum of order quantities across all sizes.
 * [PHASE 5] Ensures non-numeric and negative values are handled gracefully.
 */
export function calculateTotalOrderQty(sizes: OrderSize[] | null | undefined): number {
    if (!sizes || !Array.isArray(sizes)) return 0;

    return sizes.reduce((total, size) => {
        const qty = typeof size.order_quantity === 'string' 
            ? parseInt(size.order_quantity, 10) 
            : size.order_quantity;
        
        // Handle NaN (non-numeric) and prevent negative values (Math.max(0, ...))
        const safeQty = isNaN(qty as number) ? 0 : Math.max(0, qty as number);
        
        return total + safeQty;
    }, 0);
}

/**
 * Validates and sanitizes a single quantity input.
 * Ensures the value is a positive integer or zero.
 */
export function sanitizeQuantity(input: string | number): number {
    const parsed = typeof input === 'string' ? parseInt(input, 10) : input;
    if (isNaN(parsed as number)) return 0;
    return Math.max(0, Math.floor(parsed as number));
}
