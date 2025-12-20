"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { Database } from "@/lib/supabase/types"
import { MainNav } from "@/components/layout/main-nav"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { formatCurrency, cn } from "@/lib/utils"
// Use simple lucide icons
import { Check, Info, MessageCircle, ShoppingCart, ChevronLeft, Calendar as CalendarIcon, MapPin } from "lucide-react"

type Product = Database['public']['Tables']['products']['Row']
type Tier = Database['public']['Tables']['product_tiers']['Row']
type Addon = Database['public']['Tables']['addons']['Row']
type PriceRow = Database['public']['Tables']['product_price_rows']['Row']
type ProductImage = Database['public']['Tables']['product_images']['Row']
type Settings = { whatsapp_link: string | null, phone: string | null }

interface ProductDetailClientProps {
    product: Product
    tiers: Tier[]
    addons: Addon[]
    priceRows: PriceRow[]
    images: ProductImage[]
    settings: Settings
}

export function ProductDetailClient({ product, tiers, addons, priceRows, images, settings }: ProductDetailClientProps) {
    // State
    const [selectedTierId, setSelectedTierId] = useState<string | null>(tiers.length > 0 ? tiers[0].id : null)
    const [selectedAddons, setSelectedAddons] = useState<string[]>([])
    const [selectedImage, setSelectedImage] = useState<ProductImage | null>(images.length > 0 ? images[0] : null)

    // For Amount Service Charge: User inputs amount
    const [customAmount, setCustomAmount] = useState<number | "">("")

    // Order details
    const [deliveryDate, setDeliveryDate] = useState("")
    const [location, setLocation] = useState("")
    const [notes, setNotes] = useState("")

    // Derived Values
    const selectedTier = tiers.find(t => t.id === selectedTierId)
    
    // Update selected image when images change
    useEffect(() => {
        if (images.length > 0 && !selectedImage) {
            setSelectedImage(images[0])
        }
    }, [images, selectedImage])

    // Calculate Prices based on Type
    const basePrice = useMemo(() => {
        // If product has tiers, use selected tier price
        if (tiers.length > 0 && selectedTier) {
            return selectedTier.price
        }
        
        if (product.pricing_type === 'FIXED') return product.price || 0
        if (product.pricing_type === 'RANGE') return product.price_min || 0 // Just start price

        if (product.pricing_type === 'AMOUNT_SERVICE_CHARGE') {
            if (!customAmount) return 0
            // Find row matching amount
            const row = priceRows.find(pr => {
                const amt = Number(customAmount)
                if (pr.amount_max) {
                    return amt >= (pr.amount_min || 0) && amt <= pr.amount_max
                }
                return amt >= (pr.amount_min || 0)
            })

            return row ? row.service_charge : 0
        }

        return 0
    }, [product, selectedTier, customAmount, priceRows, tiers])

    // Total Calculation
    const totalPrice = useMemo(() => {
        let total = 0

        // Base Price - use basePrice which already handles tiers correctly
        total += Number(basePrice)

        // For AMOUNT_SERVICE_CHARGE, add the cash amount
        if (product.pricing_type === 'AMOUNT_SERVICE_CHARGE' && customAmount) {
            total += Number(customAmount)
        }

        // Addons
        selectedAddons.forEach(id => {
            const addon = addons.find(a => a.id === id)
            if (addon) total += addon.price
        })

        return total
    }, [product, basePrice, selectedAddons, addons, customAmount])

    // WhatsApp Logic
    const handleWhatsAppOrder = async () => {
        const phoneNumber = settings.whatsapp_link?.replace("https://wa.me/", "") || "233245131057"

        // Build order items snapshot
        const orderItems = {
            product_id: product.id,
            product_name: product.name,
            pricing_type: product.pricing_type,
            selected_tier: selectedTier ? {
                id: selectedTier.id,
                name: selectedTier.name,
                price: selectedTier.price
            } : null,
            custom_amount: product.pricing_type === 'AMOUNT_SERVICE_CHARGE' ? Number(customAmount) : null,
            service_charge: product.pricing_type === 'AMOUNT_SERVICE_CHARGE' ? Number(basePrice) : null,
            addons: selectedAddons.map(id => {
                const a = addons.find(x => x.id === id)
                return a ? { id: a.id, name: a.name, price: a.price } : null
            }).filter(Boolean)
        }

        // Save order request to database
        try {
            const { createClient } = await import('@/lib/supabase/client')
            const supabase = createClient()
            
            // Generate order number
            const orderNo = `ORD-${Date.now().toString().slice(-6)}`
            
            await supabase.from('order_requests').insert({
                order_no: orderNo,
                phone: phoneNumber,
                whatsapp: phoneNumber,
                delivery_location: location || null,
                event_date: deliveryDate || null,
                notes: notes || null,
                items: orderItems as any,
                total_estimate: totalPrice,
                status: 'NEW' as const,
                source: 'WHATSAPP' as const
            } as any)
        } catch (error) {
            console.error('Failed to save order request:', error)
            // Continue anyway - don't block user from opening WhatsApp
        }

        let message = `*Order Inquiry: ${product.name}*\n`
        message += `Type: ${product.pricing_type}\n`

        if (product.pricing_type === 'FIXED' && selectedTier) {
            message += `Selected Tier: ${selectedTier.name} (${formatCurrency(selectedTier.price)})\n`
        }

        if (product.pricing_type === 'AMOUNT_SERVICE_CHARGE') {
            message += `Cash Amount: ${formatCurrency(Number(customAmount) || 0)}\n`
            message += `Service Charge: ${formatCurrency(Number(basePrice))}\n`
        }

        if (selectedAddons.length > 0) {
            message += `\n*Add-ons:*\n`
            selectedAddons.forEach(id => {
                const a = addons.find(x => x.id === id)
                if (a) message += `- ${a.name} (${formatCurrency(a.price)})\n`
            })
        }

        message += `\n*Details:*\n`
        message += `Date: ${deliveryDate || "Not specified"}\n`
        message += `Location: ${location || "Not specified"}\n`
        message += `Notes: ${notes || "None"}\n`

        message += `\n*Total Estimate: ${formatCurrency(totalPrice)}*`

        const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
        window.open(url, '_blank')
    }

    return (
        <>
            <MainNav />
            <div className="container py-8 md:py-12">
                <Link href="/shop" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Back to Shop
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Left: Images */}
                    <div className="space-y-4">
                        {/* Main Image */}
                        <div className="aspect-square bg-secondary rounded-xl overflow-hidden relative border shadow-sm">
                            {images.length > 0 ? (
                                <img 
                                    src={selectedImage?.url || images[0].url} 
                                    alt={product.name} 
                                    className="w-full h-full object-cover transition-opacity duration-300" 
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted">No Image</div>
                            )}
                        </div>
                        
                        {/* Thumbnail Gallery */}
                        {images.length > 1 && (
                            <div className="grid grid-cols-4 gap-2">
                                {images.map((img, index) => {
                                    const isSelected = selectedImage?.id === img.id || (!selectedImage && index === 0)
                                    return (
                                        <button
                                            key={img.id}
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

                    {/* Right: Details */}
                    <div>
                        <div className="mb-6">
                            <h1 className="text-3xl md:text-4xl font-bold mb-2">{product.name}</h1>
                            <p className="text-muted-foreground text-lg">{product.short_desc}</p>
                        </div>

                        <div className="space-y-8">
                            {/* Pricing Logic Section */}
                            <div className="p-6 bg-card border rounded-xl shadow-sm space-y-6">

                                {/* TIER SELECTOR */}
                                {tiers.length > 0 && (
                                    <div className="space-y-3">
                                        <Label className="text-base font-semibold">Choose Your Option</Label>
                                        <p className="text-sm text-muted-foreground mb-4">Select the package option that best suits your needs:</p>
                                        <div className="grid grid-cols-1 gap-3">
                                            {tiers.map(tier => (
                                                <div
                                                    key={tier.id}
                                                    className={cn(
                                                        "cursor-pointer border-2 rounded-lg p-4 transition-all hover:border-primary/50 hover:shadow-md",
                                                        selectedTierId === tier.id ? "border-primary bg-primary/5 shadow-md" : "border-muted"
                                                    )}
                                                    onClick={() => setSelectedTierId(tier.id)}
                                                >
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className="flex-1">
                                                            <span className="font-bold text-lg">{tier.name}</span>
                                                        </div>
                                                        <span className="font-bold text-primary text-lg ml-4">{formatCurrency(tier.price)}</span>
                                                    </div>
                                                    {tier.inclusions && tier.inclusions.length > 0 && (
                                                        <div className="mt-2">
                                                            <p className="text-xs font-medium text-muted-foreground mb-1">Includes:</p>
                                                            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                                                                {tier.inclusions.map((inc, i) => (
                                                                    <li key={i} className="leading-relaxed">{inc}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* AMOUNT INPUT (Money Bouquets) */}
                                {product.pricing_type === 'AMOUNT_SERVICE_CHARGE' && (
                                    <div className="space-y-3">
                                        <Label className="text-base font-semibold">Enter Cash Amount (GHS)</Label>
                                        <Input
                                            type="number"
                                            placeholder="e.g. 500"
                                            value={customAmount}
                                            onChange={(e) => setCustomAmount(Number(e.target.value))}
                                        />
                                        {customAmount ? (
                                            <p className="text-sm">
                                                Service Charge: <span className="font-bold text-primary">{formatCurrency(Number(basePrice))}</span>
                                            </p>
                                        ) : (
                                            <p className="text-xs text-muted-foreground">Enter amount to see service charge.</p>
                                        )}
                                    </div>
                                )}

                                {/* ADDONS */}
                                {addons.length > 0 && (
                                    <div className="space-y-3 pt-4 border-t">
                                        <Label className="text-base font-semibold">Enhance Your Gift (Add-ons)</Label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {addons.map(addon => (
                                                <div key={addon.id} className="flex items-start space-x-3 bg-secondary/20 p-3 rounded-lg">
                                                    <Checkbox
                                                        id={addon.id}
                                                        checked={selectedAddons.includes(addon.id)}
                                                        onCheckedChange={(checked) => {
                                                            if (checked) setSelectedAddons([...selectedAddons, addon.id])
                                                            else setSelectedAddons(selectedAddons.filter(id => id !== addon.id))
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

                                {/* ORDER INFO */}
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

                                {/* TOTAL & ACTION */}
                                <div className="pt-6 border-t flex flex-col gap-4">
                                    <div className="flex items-center justify-between text-lg font-bold">
                                        <span>Total Estimate</span>
                                        <span>{formatCurrency(totalPrice)}</span>
                                    </div>
                                    <Button size="lg" className="w-full text-base" onClick={handleWhatsAppOrder}>
                                        <MessageCircle className="mr-2 h-5 w-5" />
                                        Order via WhatsApp
                                    </Button>
                                    <p className="text-xs text-center text-muted-foreground">
                                        You will adhere to our 70% deposit policy shown in chat.
                                    </p>
                                </div>
                            </div>

                            {/* Description */}
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
