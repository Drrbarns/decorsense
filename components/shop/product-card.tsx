"use client"

import Link from "next/link"
import { Database } from "@/lib/supabase/types"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"

type Product = Database['public']['Tables']['products']['Row']

interface ProductCardProps {
    product: Product
}

export function ProductCard({ product }: ProductCardProps) {
    // Determine price display string
    let priceDisplay = "Price Varies"
    if (product.pricing_type === 'FIXED' && product.price) {
        priceDisplay = formatCurrency(product.price)
    } else if (product.pricing_type === 'RANGE' && product.price_min) {
        priceDisplay = `From ${formatCurrency(product.price_min)}`
    } else if (product.pricing_type === 'AMOUNT_SERVICE_CHARGE') {
        priceDisplay = "Service Charge Pricing"
    } else if (product.pricing_type === 'REQUEST_QUOTE') {
        priceDisplay = "Request Quote"
    }

    // Get first image URL - handle both array of objects and array of strings
    const getImageUrl = () => {
        const images = (product as any).images
        if (!images || !Array.isArray(images) || images.length === 0) return null
        const firstImage = images[0]
        return typeof firstImage === 'string' ? firstImage : firstImage.url || null
    }

    const imageUrl = getImageUrl()

    return (
        <Link href={`/shop/${product.slug}`} className="group h-full">
            <Card className="h-full overflow-hidden border border-primary/5 shadow-md hover:shadow-2xl transition-all duration-500 bg-card rounded-2xl group-hover:border-primary/20">
                <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-muted to-secondary rounded-t-2xl">
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
                    
                    {/* Image display logic */}
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary to-primary/5 flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                                    <span className="text-2xl">📦</span>
                                </div>
                                <span className="text-xs font-medium text-muted-foreground">No Image</span>
                            </div>
                        </div>
                    )}
                    
                    {/* Shine Effect */}
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 z-20" />
                </div>

                <CardContent className="p-5">
                    <div className="mb-2">
                        <span className={`inline-block text-xs font-semibold px-2 py-1 rounded-full ${
                            product.is_active 
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                                : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                        }`}>
                            {product.is_active ? "Available" : "Unavailable"}
                        </span>
                    </div>
                    <h3 className="font-bold text-lg md:text-xl line-clamp-1 group-hover:text-primary transition-colors mb-2">
                        {product.name}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                        {product.short_desc || "View details for options and pricing."}
                    </p>
                </CardContent>

                <CardFooter className="p-5 pt-0 flex items-center justify-between">
                    <div className="font-bold text-lg text-primary">
                        {priceDisplay}
                    </div>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-full px-4 hover:bg-primary hover:text-primary-foreground"
                    >
                        View Details →
                    </Button>
                </CardFooter>
            </Card>
        </Link>
    )
}
