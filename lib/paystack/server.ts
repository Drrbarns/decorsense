const PAYSTACK_API = "https://api.paystack.co"

export function getPaystackSecretKey(): string {
    const key = process.env.PAYSTACK_SECRET_KEY
    if (!key) throw new Error("PAYSTACK_SECRET_KEY is not configured")
    return key
}

export function getAppUrl(): string {
    const url = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL
    if (!url) return "http://localhost:3000"
    if (url.startsWith("http")) return url.replace(/\/$/, "")
    return `https://${url.replace(/\/$/, "")}`
}

export type InitializeResult =
    | { ok: true; authorization_url: string; reference: string }
    | { ok: false; message: string }

export async function initializeTransaction(params: {
    email: string
    amountPesewas: number
    reference: string
    callbackUrl: string
    currency?: string
    metadata?: Record<string, string>
}): Promise<InitializeResult> {
    const secret = getPaystackSecretKey()
    const res = await fetch(`${PAYSTACK_API}/transaction/initialize`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${secret}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email: params.email,
            amount: params.amountPesewas,
            reference: params.reference,
            callback_url: params.callbackUrl,
            currency: params.currency ?? "GHS",
            channels: ["card", "mobile_money", "bank", "ussd"],
            metadata: params.metadata,
        }),
    })

    const json = (await res.json()) as {
        status: boolean
        message: string
        data?: { authorization_url: string; reference: string }
    }

    if (!json.status || !json.data?.authorization_url) {
        return { ok: false, message: json.message || "Paystack initialize failed" }
    }

    return {
        ok: true,
        authorization_url: json.data.authorization_url,
        reference: json.data.reference,
    }
}

export type VerifyResult =
    | { ok: true; amount: number; currency: string; customer: { email?: string } }
    | { ok: false; message: string }

export async function verifyTransaction(reference: string): Promise<VerifyResult> {
    const secret = getPaystackSecretKey()
    const res = await fetch(`${PAYSTACK_API}/transaction/verify/${encodeURIComponent(reference)}`, {
        headers: { Authorization: `Bearer ${secret}` },
    })

    const json = (await res.json()) as {
        status: boolean
        message: string
        data?: {
            status: string
            amount: number
            currency: string
            customer?: { email?: string }
        }
    }

    if (!json.status || !json.data) {
        return { ok: false, message: json.message || "Verification failed" }
    }

    if (json.data.status !== "success") {
        return { ok: false, message: `Payment not successful (${json.data.status})` }
    }

    return {
        ok: true,
        amount: json.data.amount,
        currency: json.data.currency,
        customer: json.data.customer ?? {},
    }
}
