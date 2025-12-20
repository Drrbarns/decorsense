"use client"

import { ProductForm } from "@/components/admin/product-form"
import { Database } from "@/lib/supabase/types"

type Product = Database['public']['Tables']['products']['Row']
type Tier = Database['public']['Tables']['product_tiers']['Row']

export function EditProductClient({ product, tiers }: { product: Product, tiers: Tier[] }) {
    return (
        <div className="flex-1 p-4 md:p-6 lg:p-8">
            <ProductForm initialData={product} initialTiers={tiers} />
        </div>
    )
}
