import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import {
    buildOrderItemsSnapshot,
    computeBasePrice,
    computeProductOrderTotal,
    type OrderSelectionInput,
} from "@/lib/checkout/order-total"
import { getAppUrl, initializeTransaction } from "@/lib/paystack/server"

export const dynamic = "force-dynamic"

type Body = {
    productId: string
    productSlug: string
    selectedTierId: string | null
    selectedAddonIds: string[]
    customAmount: number | null
    customerEmail: string
    customerName: string
    customerPhone: string
    deliveryDate?: string | null
    location?: string | null
    notes?: string | null
}

function isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

export async function POST(req: Request) {
    let body: Body
    try {
        body = (await req.json()) as Body
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }

    if (!body.productId || !body.productSlug) {
        return NextResponse.json({ error: "Missing product" }, { status: 400 })
    }
    if (!body.customerEmail?.trim() || !isValidEmail(body.customerEmail)) {
        return NextResponse.json({ error: "Valid email is required for payment" }, { status: 400 })
    }
    if (!body.customerName?.trim()) {
        return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }
    if (!body.customerPhone?.trim()) {
        return NextResponse.json({ error: "Phone is required" }, { status: 400 })
    }

    const selection: OrderSelectionInput = {
        selectedTierId: body.selectedTierId,
        selectedAddonIds: Array.isArray(body.selectedAddonIds) ? body.selectedAddonIds : [],
        customAmount:
            body.customAmount != null && !Number.isNaN(Number(body.customAmount))
                ? Number(body.customAmount)
                : null,
    }

    const supabase = createClient()

    const { data: product, error: pErr } = await (supabase.from("products") as any)
        .select("*")
        .eq("id", body.productId)
        .eq("is_active", true)
        .single()

    if (pErr || !product) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const [{ data: tiersRes }, { data: addonsRes }, { data: priceRowsRes }] = await Promise.all([
        (supabase.from("product_tiers") as any).select("*").eq("product_id", product.id).order("sort_order"),
        (supabase.from("addons") as any).select("*").eq("is_active", true),
        (supabase.from("product_price_rows") as any).select("*").eq("product_id", product.id),
    ])

    const tiers = tiersRes || []
    const addons = addonsRes || []
    const rows = priceRowsRes || []

    if (tiers.length > 0 && !selection.selectedTierId) {
        return NextResponse.json({ error: "Please select a package option" }, { status: 400 })
    }

    const total = computeProductOrderTotal(product, tiers, addons, rows, selection)

    if (total <= 0) {
        return NextResponse.json(
            { error: "This product cannot be paid for online. Request a quote or contact us." },
            { status: 400 }
        )
    }

    const serviceChargeOnly = computeBasePrice(product, tiers, rows, selection)
    const orderItems = {
        ...buildOrderItemsSnapshot(product, tiers, addons, selection, serviceChargeOnly),
        product_slug: body.productSlug,
    }

    const reference = `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
    const amountPesewas = Math.round(total * 100)

    if (amountPesewas < 100) {
        return NextResponse.json({ error: "Amount too small" }, { status: 400 })
    }

    const appUrl = getAppUrl()
    const callbackUrl = `${appUrl}/api/paystack/callback`

    const { error: insertErr } = await (supabase.from("order_requests") as any).insert({
        order_no: reference,
        customer_name: body.customerName.trim(),
        email: body.customerEmail.trim(),
        phone: body.customerPhone.trim(),
        delivery_location: body.location?.trim() || null,
        event_date: body.deliveryDate || null,
        notes: body.notes?.trim() || null,
        items: orderItems,
        total_estimate: total,
        status: "NEW",
        source: "PAYMENT",
        internal_notes: "Awaiting Paystack payment",
    })

    if (insertErr) {
        console.error(insertErr)
        return NextResponse.json({ error: "Could not create order" }, { status: 500 })
    }

    const init = await initializeTransaction({
        email: body.customerEmail.trim(),
        amountPesewas,
        reference,
        callbackUrl,
        metadata: {
            product_slug: body.productSlug,
            customer_name: body.customerName.trim().slice(0, 100),
        },
    })

    if (!init.ok) {
        await (supabase.from("order_requests") as any).delete().eq("order_no", reference)
        return NextResponse.json({ error: init.message }, { status: 502 })
    }

    return NextResponse.json({ authorization_url: init.authorization_url, reference })
}
