import { PaymentResultToast } from "@/components/shop/payment-result-toast"

export default function ShopLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen flex-col">
            <PaymentResultToast />
            {children}
        </div>
    )
}
