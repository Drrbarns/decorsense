import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getAppUrl, verifyTransaction } from "@/lib/paystack/server"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const reference = searchParams.get("reference") || searchParams.get("trxref")

    const appUrl = getAppUrl()
    const failRedirect = NextResponse.redirect(`${appUrl}/shop?payment=failed`, 302)

    if (!reference) {
        return failRedirect
    }

    const verified = await verifyTransaction(reference)
    if (!verified.ok) {
        return failRedirect
    }

    const supabase = createClient()
    const paidNote = `Paystack paid ${verified.amount / 100} ${verified.currency} — ref ${reference}`

    const { error } = await (supabase.from("order_requests") as any)
        .update({
            status: "CONFIRMED",
            internal_notes: paidNote,
            updated_at: new Date().toISOString(),
        })
        .eq("order_no", reference)

    if (error) {
        console.error("Paystack callback order update:", error)
    }

    const { data: order } = await (supabase.from("order_requests") as any)
        .select("items")
        .eq("order_no", reference)
        .single()

    const items = order?.items as { product_slug?: string } | null
    const slug = items?.product_slug

    let path = `${appUrl}/shop?payment=success&ref=${encodeURIComponent(reference)}`
    if (slug && typeof slug === "string" && slug.length < 200 && !slug.includes("/")) {
        path = `${appUrl}/shop/${slug}?payment=success&ref=${encodeURIComponent(reference)}`
    }

    return NextResponse.redirect(path, 302)
}
