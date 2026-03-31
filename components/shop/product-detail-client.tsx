"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { Database } from "@/lib/supabase/types"
import { MainNav } from "@/components/layout/main-nav"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { formatCurrency, cn } from "@/lib/utils"
import {
    computeBasePrice,
    computeProductOrderTotal,
    type OrderSelectionInput,
} from "@/lib/checkout/order-total"
import { ChevronLeft, Calendar as CalendarIcon, MapPin, CreditCard, Loader2 } from "lucide-react"
import { toast } from "sonner"

type Product = Database["public"]["Tables"]["products"]["Row"]
type Tier = Database["public"]["Tables"]["product_tiers"]["Row"]
type Addon = Database["public"]["Tables"]["addons"]["Row"]
type PriceRow = Database["public"]["Tables"]["product_price_rows"]["Row"]
type ProductImage = Database["public"]["Tables"]["product_images"]["Row"]

interface ProductDetailClientProps {
    product: Product
    tiers: Tier[]
    addons: Addon[]
    priceRows: PriceRow[]
    images: ProductImage[]
}

export function ProductDetailClient({ product, tiers, addons, priceRows, images }: ProductDetailClientProps) {
    const [selectedTierId, setSelectedTierId] = useState<string | null>(tiers.length > 0 ? tiers[0].id : null)
    const [selectedAddons, setSelectedAddons] = useState<string[]>([])
    const [selectedImage, setSelectedImage] = useState<ProductImage | null>(images.length > 0 ? images[0] : null)

    const [customAmount, setCustomAmount] = useState<number | "">("")

    const [deliveryDate, setDeliveryDate] = useState("")
    const [location, setLocation] = useState("")
    const [notes, setNotes] = useState("")

    const [customerName, setCustomerName] = useState("")
    const [customerEmail, setCustomerEmail] = useState("")
    const [customerPhone, setCustomerPhone] = useState("")

    const [checkoutLoading, setCheckoutLoading] = useState(false)

    const selectedTier = tiers.find((t) => t.id === selectedTierId)

    useEffect(() => {
        if (images.length > 0 && !selectedImage) {
            setSelectedImage(images[0])
        }
    }, [images, selectedImage])

    const selection: OrderSelectionInput = useMemo(
        () => ({
            selectedTierId,
            selectedAddonIds: selectedAddons,
            customAmount:
                customAmount === "" || customAmount === null
                    ? null
                    : Number(customAmount),
        }),
        [selectedTierId, selectedAddons, customAmount]
    )

    const basePrice = useMemo(
        () => computeBasePrice(product, tiers, priceRows, selection),
        [product, tiers, priceRows, selection]
    )

    const totalPrice = useMemo(
        () => computeProductOrderTotal(product, tiers, addons, priceRows, selection),
        [product, tiers, addons, priceRows, selection]
    )

    const canPayOnline =
        product.pricing_type !== "REQUEST_QUOTE" && totalPrice > 0

    const handlePaystackCheckout = async () => {
        if (!canPayOnline) return

        if (!customerName.trim()) {
            toast.error("Please enter your name")
            return
        }
        if (!customerEmail.trim()) {
            toast.error("Please enter your email")
            return
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim())) {
            toast.error("Please enter a valid email")
            return
        }
        if (!customerPhone.trim()) {
            toast.error("Please enter your phone number")
            return
        }

        setCheckoutLoading(true)
        try {
            const res = await fetch("/api/paystack/initialize", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    productId: product.id,
                    productSlug: product.slug,
                    selectedTierId,
                    selectedAddonIds: selectedAddons,
                    customAmount: selection.customAmount,
                    customerEmail: customerEmail.trim(),
                    customerName: customerName.trim(),
                    customerPhone: customerPhone.trim(),
                    deliveryDate: deliveryDate || null,
                    location: location || null,
                    notes: notes || null,
                }),
            })

            const data = (await res.json()) as { authorization_url?: string; error?: string }

            if (!res.ok || !data.authorization_url) {
                toast.error(data.error || "Could not start payment")
                return
            }

            window.location.href = data.authorization_url
        } catch (e) {
            console.error(e)
            toast.error("Something went wrong. Please try again.")
        } finally {
            setCheckoutLoading(false)
        }
    }

    return (
        <>
            <MainNav />
            <div className="container py-8 md:py-12">
                <Link
                    href="/shop"
                    className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6 transition-colors"
                >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Back to Shop
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="space-y-4">
                        <div className="aspect-square bg-secondary rounded-xl overflow-hidden relative border shadow-sm">
                            {images.length > 0 ? (
                                <img
                                    src={selectedImage?.url || images[0].url}
                                    alt={product.name}
                                    className="w-full h-full object-cover transition-opacity duration-300"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted">
                                    No Image
                                </div>
                            )}
                        </div>

                        {images.length > 1 && (
                            <div className="grid grid-cols-4 gap-2">
                                {images.map((img, index) => {
                                    const isSelected =
                                        selectedImage?.id === img.id || (!selectedImage && index === 0)
                                    return (
                                        <button
                                            key={img.id}
                                            type="button"
                                            onClick={() => setSelectedImage(img)}
                                            className={cn(
                                                "aspect-square rounded-lg overflow-hidden border-2 transition-all hover:opacity-80",
                                                isSelected ? "border-primary shadow-md" : "border-muted opacity-60 hover:opacity-100"
                                            )}
                                        >
                                            <img
                                                src={img.url}
                                                alt={`${product.name} - Image ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    <div>
                        <div className="mb-6">
                            <h1 className="text-3xl md:text-4xl font-bold mb-2">{product.name}</h1>
                            <p className="text-muted-foreground text-lg">{product.short_desc}</p>
                        </div>

                        <div className="space-y-8">
                            <div className="p-6 bg-card border rounded-xl shadow-sm space-y-6">
                                {tiers.length > 0 && (
                                    <div className="space-y-3">
                                        <Label className="text-base font-semibold">Choose Your Option</Label>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            Select the package option that best suits your needs:
                                        </p>
                                        <div className="grid grid-cols-1 gap-3">
                                            {tiers.map((tier) => (
                                                <div
                                                    key={tier.id}
                                                    role="button"
                                                    tabIndex={0}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter" || e.key === " ") {
                                                            e.preventDefault()
                                                            setSelectedTierId(tier.id)
                                                        }
                                                    }}
                                                    className={cn(
                                                        "cursor-pointer border-2 rounded-lg p-4 transition-all hover:border-primary/50 hover:shadow-md",
                                                        selectedTierId === tier.id
                                                            ? "border-primary bg-primary/5 shadow-md"
                                                            : "border-muted"
                                                    )}
                                                    onClick={() => setSelectedTierId(tier.id)}
                                                >
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className="flex-1">
                                                            <span className="font-bold text-lg">{tier.name}</span>
                                                        </div>
                                                        <span className="font-bold text-primary text-lg ml-4">
                                                            {formatCurrency(tier.price)}
                                                        </span>
                                                    </div>
                                                    {tier.inclusions && tier.inclusions.length > 0 && (
                                                        <div className="mt-2">
                                                            <p className="text-xs font-medium text-muted-foreground mb-1">
                                                                Includes:
                                                            </p>
                                                            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                                                                {tier.inclusions.map((inc, i) => (
                                                                    <li key={i} className="leading-relaxed">
                                                                        {inc}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {product.pricing_type === "AMOUNT_SERVICE_CHARGE" && (
                                    <div className="space-y-3">
                                        <Label className="text-base font-semibold">Enter Cash Amount (GHS)</Label>
                                        <Input
                                            type="number"
                                            placeholder="e.g. 500"
                                            value={customAmount}
                                            onChange={(e) =>
                                                setCustomAmount(
                                                    e.target.value === "" ? "" : Number(e.target.value)
                                                )
                                            }
                                        />
                                        {customAmount !== "" && customAmount ? (
                                            <p className="text-sm">
                                                Service Charge:{" "}
                                                <span className="font-bold text-primary">
                                                    {formatCurrency(Number(basePrice))}
                                                </span>
                                            </p>
                                        ) : (
                                            <p className="text-xs text-muted-foreground">
                                                Enter amount to see service charge.
                                            </p>
                                        )}
                                    </div>
                                )}

                                {addons.length > 0 && (
                                    <div className="space-y-3 pt-4 border-t">
                                        <Label className="text-base font-semibold">Enhance Your Gift (Add-ons)</Label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {addons.map((addon) => (
                                                <div
                                                    key={addon.id}
                                                    className="flex items-start space-x-3 bg-secondary/20 p-3 rounded-lg"
                                                >
                                                    <Checkbox
                                                        id={addon.id}
                                                        checked={selectedAddons.includes(addon.id)}
                                                        onCheckedChange={(checked) => {
                                                            if (checked)
                                                                setSelectedAddons([...selectedAddons, addon.id])
                                                            else
                                                                setSelectedAddons(
                                                                    selectedAddons.filter((id) => id !== addon.id)
                                                                )
                                                        }}
                                                    />
                                                    <div className="grid gap-1.5 leading-none">
                                                        <label
                                                            htmlFor={addon.id}
                                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                                        >
                                                            {addon.name}
                                                        </label>
                                                        <span className="text-xs text-muted-foreground">
                                                            + {formatCurrency(addon.price)}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-4 pt-4 border-t">
                                    <Label className="text-base font-semibold">Your details</Label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2 sm:col-span-2">
                                            <Label>Full name</Label>
                                            <Input
                                                value={customerName}
                                                onChange={(e) => setCustomerName(e.target.value)}
                                                placeholder="As it should appear on the order"
                                                autoComplete="name"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Email</Label>
                                            <Input
                                                type="email"
                                                value={customerEmail}
                                                onChange={(e) => setCustomerEmail(e.target.value)}
                                                placeholder="you@example.com"
                                                autoComplete="email"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Phone</Label>
                                            <Input
                                                value={customerPhone}
                                                onChange={(e) => setCustomerPhone(e.target.value)}
                                                placeholder="e.g. 024xxxxxxx"
                                                autoComplete="tel"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Delivery Date</Label>
                                            <div className="relative">
                                                <CalendarIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    type="date"
                                                    className="pl-9"
                                                    value={deliveryDate}
                                                    onChange={(e) => setDeliveryDate(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Location / Address</Label>
                                            <div className="relative">
                                                <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    placeholder="Area, City"
                                                    className="pl-9"
                                                    value={location}
                                                    onChange={(e) => setLocation(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Additional Notes (Optional)</Label>
                                        <Textarea
                                            placeholder="Color preference, message for card, etc."
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="pt-6 border-t flex flex-col gap-4">
                                    <div className="flex items-center justify-between text-lg font-bold">
                                        <span>Total</span>
                                        <span>{formatCurrency(totalPrice)}</span>
                                    </div>

                                    {product.pricing_type === "REQUEST_QUOTE" ? (
                                        <p className="text-sm text-muted-foreground text-center">
                                            This package is priced on request. Please{" "}
                                            <Link href="/contact" className="text-primary underline">
                                                contact us
                                            </Link>{" "}
                                            for a quote.
                                        </p>
                                    ) : !canPayOnline ? (
                                        <p className="text-sm text-muted-foreground text-center">
                                            Complete required options above to see your total and pay.
                                        </p>
                                    ) : (
                                        <>
                                            <Button
                                                size="lg"
                                                className="w-full text-base"
                                                onClick={handlePaystackCheckout}
                                                disabled={checkoutLoading}
                                            >
                                                {checkoutLoading ? (
                                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                ) : (
                                                    <CreditCard className="mr-2 h-5 w-5" />
                                                )}
                                                Pay with Paystack
                                            </Button>
                                            <p className="text-xs text-center text-muted-foreground">
                                                Secure checkout via Paystack (cards, mobile money, bank). You will be
                                                redirected to complete payment.
                                            </p>
                                        </>
                                    )}
                                </div>
                            </div>

                            {product.long_desc && (
                                <div className="prose prose-sm max-w-none text-muted-foreground">
                                    <h3 className="text-foreground font-semibold">Description</h3>
                                    <p>{product.long_desc}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    )
}
