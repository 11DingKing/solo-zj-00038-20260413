export class LowStockAlertPayload {
    productId?: number;
    productName?: string;
    brandName?: string;
    sku?: string;
    barcode?: string;
    currentQuantity?: number;
    lowStockPoint?: number;
    shortageQuantity?: number;
    categoryName?: string;
    selected?: boolean;
    replenishQuantity?: number;
}

export class ReplenishItemPayload {
    productId?: number;
    quantity?: number;
}

export class BatchReplenishPayload {
    items?: ReplenishItemPayload[];
    remark?: string;
}
