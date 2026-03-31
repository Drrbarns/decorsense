import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { EditProductClient } from "./client"

// Server Component Wrapper
export default async function EditProductPage({ params }: { params: { id: string } }) {
    const supabase = createClient()

    const { data: product } = await supabase.from('products').select('*').eq('id', params.id).single()

    if (!product) notFound()

    const { data: tiers } = await supabase.from('product_tiers').select('*').eq('product_id', params.id).order('sort_order')

    return <EditProductClient product={product} tiers={tiers || []} />
}
