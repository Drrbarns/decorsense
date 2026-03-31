import type { Database } from "@/lib/supabase/types"

type Product = Database["public"]["Tables"]["products"]["Row"]
type Tier = Database["public"]["Tables"]["product_tiers"]["Row"]
type Addon = Database["public"]["Tables"]["addons"]["Row"]
type PriceRow = Database["public"]["Tables"]["product_price_rows"]["Row"]

export type OrderSelectionInput = {
    selectedTierId: string | null
    selectedAddonIds: string[]
    customAmount: number | null
}

/** Matches product-detail-client: base line (tier/fixed/range/service charge only). */
export function computeBasePrice(
    product: Product,
    tiers: Tier[],
    priceRows: PriceRow[],
    selection: OrderSelectionInput
): number {
    const selectedTier = tiers.find((t) => t.id === selection.selectedTierId)

    if (tiers.length > 0 && selectedTier) return selectedTier.price
    if (product.pricing_type === "FIXED") return product.price ?? 0
    if (product.pricing_type === "RANGE") return product.price_min ?? 0

    if (product.pricing_type === "AMOUNT_SERVICE_CHARGE") {
        const amt = selection.customAmount
        if (amt == null || Number.isNaN(amt) || amt <= 0) return 0
        const row = priceRows.find((pr) => {
            if (pr.amount_max != null) {
                return amt >= (pr.amount_min ?? 0) && amt <= pr.amount_max
            }
            return amt >= (pr.amount_min ?? 0)
        })
        return row ? row.service_charge : 0
    }

    return 0
}

export function computeProductOrderTotal(
    product: Product,
    tiers: Tier[],
    addons: Addon[],
    priceRows: PriceRow[],
    selection: OrderSelectionInput
): number {
    if (product.pricing_type === "REQUEST_QUOTE") return 0

    const base = computeBasePrice(product, tiers, priceRows, selection)
    if (product.pricing_type === "AMOUNT_SERVICE_CHARGE") {
        if (!selection.customAmount || selection.customAmount <= 0) return 0
    }

    let total = Number(base)
    if (product.pricing_type === "AMOUNT_SERVICE_CHARGE" && selection.customAmount) {
        total += selection.customAmount
    }
    selection.selectedAddonIds.forEach((id) => {
        const addon = addons.find((a) => a.id === id)
        if (addon) total += addon.price
    })
    return total
}

export function buildOrderItemsSnapshot(
    product: Product,
    tiers: Tier[],
    addons: Addon[],
    selection: OrderSelectionInput,
    serviceChargeOnly: number
) {
    const selectedTier = tiers.find((t) => t.id === selection.selectedTierId)
    return {
        product_id: product.id,
        product_name: product.name,
        pricing_type: product.pricing_type,
        selected_tier: selectedTier
            ? { id: selectedTier.id, name: selectedTier.name, price: selectedTier.price }
            : null,
        custom_amount:
            product.pricing_type === "AMOUNT_SERVICE_CHARGE" ? selection.customAmount : null,
        service_charge:
            product.pricing_type === "AMOUNT_SERVICE_CHARGE" ? serviceChargeOnly : null,
        addons: selection.selectedAddonIds
            .map((id) => {
                const a = addons.find((x) => x.id === id)
                return a ? { id: a.id, name: a.name, price: a.price } : null
            })
            .filter(Boolean),
    }
}
