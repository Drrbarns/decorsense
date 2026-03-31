"use client"

import { useEffect } from "react"
import { toast } from "sonner"

/** Shows toast when returning from Paystack on /shop or /shop/[slug] with ?payment= */
export function PaymentResultToast() {
    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const payment = params.get("payment")
        if (payment === "success") {
            toast.success("Payment received. Thank you — we will follow up on your order shortly.")
        } else if (payment === "failed") {
            toast.error("Payment was not completed. You can try again when ready.")
        }
    }, [])

    return null
}
