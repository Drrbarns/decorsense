import { NextResponse } from "next/server"
import { createHmac } from "crypto"
import { createClient } from "@/lib/supabase/server"
import { verifyTransaction } from "@/lib/paystack/server"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
    const secret = process.env.PAYSTACK_SECRET_KEY
    if (!secret) {
        return NextResponse.json({ error: "Not configured" }, { status: 500 })
    }

    const raw = await req.text()
    const signature = req.headers.get("x-paystack-signature")
    const hash = createHmac("sha512", secret).update(raw).digest("hex")

    if (!signature || hash !== signature) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    let event: { event?: string; data?: { reference?: string } }
    try {
        event = JSON.parse(raw)
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }

    if (event.event !== "charge.success" || !event.data?.reference) {
        return NextResponse.json({ received: true })
    }

    const reference = event.data.reference
    const verified = await verifyTransaction(reference)
    if (!verified.ok) {
        return NextResponse.json({ received: true })
    }

    const supabase = createClient()
    const paidNote = `Paystack paid ${verified.amount / 100} ${verified.currency} — ref ${reference} (webhook)`

    await (supabase.from("order_requests") as any)
        .update({
            status: "CONFIRMED",
            internal_notes: paidNote,
            updated_at: new Date().toISOString(),
        })
        .eq("order_no", reference)

    return NextResponse.json({ received: true })
}
