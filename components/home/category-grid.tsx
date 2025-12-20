"use client"

import Link from "next/link"
import { useData } from "@/components/providers/data-provider"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export function CategoryGrid() {
    const { categories, loading } = useData()

    // Filter only active categories that should be shown on homepage
    // Based on user requirements: Fresh Flowers, Faux & Artificial Flowers, Gift Box Packages, 
    // Hot Air Balloon Treat Boxes, Room Decoration, Surprise Packages
    const homepageCategorySlugs = [
        'fresh-flowers',
        'faux-flowers',
        'gift-boxes-her', // Will combine with gift-boxes-him
        'gift-boxes-him',
        'balloon-treats',
        'room-decor',
        'surprise-packages'
    ]
    
    let activeCategories = categories.filter(c => c.is_active && homepageCategorySlugs.includes(c.slug))
    
    // Combine Gift Box Packages (For Her) and (For Him) into one display item
    const giftBoxHer = activeCategories.find(c => c.slug === 'gift-boxes-her')
    const giftBoxHim = activeCategories.find(c => c.slug === 'gift-boxes-him')
    
    if (giftBoxHer || giftBoxHim) {
        // Remove individual gift box categories
        activeCategories = activeCategories.filter(c => !['gift-boxes-her', 'gift-boxes-him'].includes(c.slug))
        
        // Add combined "Gift Box Packages" category
        activeCategories.push({
            ...(giftBoxHer || giftBoxHim || {}),
            id: 'gift-boxes-combined',
            name: 'Gift Box Packages',
            slug: 'gift-boxes',
            description: 'Curated gift boxes for her and him.',
            sort_order: Math.min(giftBoxHer?.sort_order || 999, giftBoxHim?.sort_order || 999)
        } as any)
    }
    
    // Sort by sort_order
    activeCategories.sort((a, b) => a.sort_order - b.sort_order)

    if (loading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-48 w-full rounded-xl" />)}
            </div>
        )
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {activeCategories.map((cat) => (
                <Link 
                    href={cat.slug === 'gift-boxes' ? '/shop?category=gift-boxes' : `/shop?category=${cat.slug}`} 
                    key={cat.id} 
                    className="group block relative"
                >
                    <div className="relative overflow-hidden rounded-3xl aspect-[3/4] bg-muted shadow-lg group-hover:shadow-2xl transition-all duration-500 border border-primary/5 group-hover:border-primary/20">
                        {/* Gradient Overlay on Hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
                        
                        {/* Placeholder Image Logic using gradients if no image */}
                        {cat.image_url ? (
                            <img
                                src={cat.image_url}
                                alt={cat.name}
                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                        ) : (
                            <div className="h-full w-full bg-gradient-to-br from-primary/10 via-secondary to-primary/5 flex items-center justify-center relative">
                                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary to-transparent" />
                                <span className="text-5xl font-black text-primary/20 tracking-tighter uppercase select-none">
                                    {cat.name.substring(0, 2)}
                                </span>
                            </div>
                        )}

                        {/* Text Overlay */}
                        <div className="absolute inset-x-0 bottom-0 pt-24 pb-6 px-5 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col justify-end text-white z-20">
                            <h3 className="font-bold text-xl md:text-2xl leading-tight mb-2 tracking-wide drop-shadow-lg group-hover:translate-y-[-4px] transition-transform duration-300">
                                {cat.name}
                            </h3>
                            <div className="flex items-center text-sm font-semibold text-white/90 overflow-hidden h-0 group-hover:h-6 transition-all duration-300 gap-2">
                                <span>Explore</span>
                                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                        
                        {/* Shine Effect */}
                        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 z-30" />
                    </div>
                </Link>
            ))}
        </div>
    )
}
