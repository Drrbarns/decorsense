"use client"

import { MainNav } from "@/components/layout/main-nav"
import { Footer } from "@/components/layout/footer"
import { Hero } from "@/components/home/hero"
import { CategoryGrid } from "@/components/home/category-grid"
import { useData } from "@/components/providers/data-provider"
import { ProductCard } from "@/components/shop/product-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Star, Truck, ShieldCheck, Clock, Gift } from "lucide-react"
import { TestimonialsSection } from "@/components/home/testimonials"

export default function Home() {
    const { products, categories, loading } = useData()

    // Get trending products for Trending Packages section
    const trendingProducts = products
        .filter(p => (p as any).is_trending && p.is_active)
        .slice(0, 4)

    // If no trending products, fallback to featured, then any active
    const displayProducts = trendingProducts.length > 0
        ? trendingProducts
        : products.filter(p => p.is_featured && p.is_active).length > 0
            ? products.filter(p => p.is_featured && p.is_active).slice(0, 4)
            : products.filter(p => p.is_active).slice(0, 4)

    return (
        <>
            <MainNav />
            <main className="flex-1">
                <Hero />

                {/* Categories */}
                <section className="py-32 bg-gradient-to-b from-background to-secondary/30 relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(circle_at_1px_1px,rgb(0,0,0)_1px,transparent_0)] [background-size:32px_32px]" />
                    
                    <div className="container relative z-10">
                        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                            <div className="max-w-2xl">
                                <div className="inline-block mb-4">
                                    <span className="text-sm font-semibold text-primary uppercase tracking-wider">Our Collections</span>
                                </div>
                                <h2 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                                    Browse Collections
                                </h2>
                                <p className="text-muted-foreground text-lg md:text-xl">Find the perfect category for your surprise.</p>
                            </div>
                            <Link 
                                href="/shop" 
                                className="group inline-flex items-center gap-2 text-primary font-semibold hover:text-primary/80 transition-colors text-lg px-6 py-3 rounded-full border border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300"
                            >
                                View Full Catalog 
                                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                        <CategoryGrid />
                    </div>
                </section>

                {/* Featured Category Products - Money Packages */}
                {!loading && (() => {
                    // Get Money Packages category - try multiple possible slugs
                    const moneyCategory = categories.find(c => 
                        c.slug === 'money-packages' || 
                        c.slug === 'money-bouquets' ||
                        c.name?.toLowerCase().includes('money')
                    )
                    
                    // Get products from Money Packages category
                    const moneyProducts = moneyCategory 
                        ? products.filter(p => p.category_id === moneyCategory.id && p.is_active).slice(0, 4)
                        : []
                    
                    if (moneyProducts.length === 0) {
                        return null // Don't show section if no products
                    }

                    const categorySlug = moneyCategory?.slug || 'money-packages'

                    return (
                        <section className="py-32 bg-background relative overflow-hidden">
                            <div className="container relative z-10">
                                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                                    <div className="max-w-2xl">
                                        <div className="inline-block mb-4">
                                            <span className="text-sm font-semibold text-primary uppercase tracking-wider">Featured Collection</span>
                                        </div>
                                        <h2 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                                            Money Packages
                                        </h2>
                                        <p className="text-muted-foreground text-lg md:text-xl">Elegant money arrangements perfect for any special occasion.</p>
                                    </div>
                                    <Link 
                                        href={`/shop?category=${categorySlug}`} 
                                        className="group inline-flex items-center gap-2 text-primary font-semibold hover:text-primary/80 transition-colors text-lg px-6 py-3 rounded-full border border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300"
                                    >
                                        View All Money Packages 
                                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                                    {moneyProducts.map(p => (
                                        <ProductCard key={p.id} product={p} />
                                    ))}
                                </div>
                            </div>
                        </section>
                    )
                })()}

                {/* Best Sellers / Featured */}
                <section className="py-32 bg-gradient-to-b from-secondary/30 to-background relative overflow-hidden">
                    {/* Decorative Gradient */}
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
                    
                    <div className="container relative z-10">
                        <div className="text-center mb-20">
                            <div className="inline-block mb-4">
                                <span className="text-sm font-semibold text-primary uppercase tracking-wider">Popular Now</span>
                            </div>
                            <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                                Trending Packages
                            </h2>
                            <p className="text-muted-foreground max-w-2xl mx-auto text-lg md:text-xl">
                                Our most popular choices loved by hundreds of customers.
                            </p>
                        </div>

                        {loading ? (
                            <div className="flex justify-center items-center py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent"></div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                                {displayProducts.map(p => (
                                    <ProductCard key={p.id} product={p} />
                                ))}
                            </div>
                        )}

                        <div className="mt-20 text-center">
                            <Button 
                                size="lg" 
                                variant="outline" 
                                className="group rounded-full px-12 h-14 text-lg border-2 border-primary/30 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 shadow-lg hover:shadow-xl" 
                                asChild
                            >
                                <Link href="/shop" className="flex items-center gap-2">
                                    Explore All Products
                                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </section>

                {/* Testimonials */}
                <section className="py-32 bg-gradient-to-b from-background via-secondary/20 to-background relative overflow-hidden">
                    {/* Background Decoration */}
                    <div className="absolute inset-0 opacity-5">
                        <div className="absolute top-20 left-10 w-72 h-72 bg-primary rounded-full blur-3xl" />
                        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500 rounded-full blur-3xl" />
                    </div>
                    
                    <div className="container relative z-10">
                        <div className="text-center mb-20">
                            <div className="inline-block mb-4">
                                <span className="text-sm font-semibold text-primary uppercase tracking-wider">Testimonials</span>
                            </div>
                            <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                                What Our Customers Say
                            </h2>
                            <p className="text-muted-foreground max-w-2xl mx-auto text-lg md:text-xl">
                                Don't just take our word for it. See what our satisfied customers have to say.
                            </p>
                        </div>
                        <TestimonialsSection />
                    </div>
                </section>

                {/* CTA */}
                <section className="py-16 md:py-20 bg-primary text-primary-foreground relative overflow-hidden">
                    {/* Subtle Pattern Overlay */}
                    <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_1px_1px,rgb(255,255,255)_1px,transparent_0)] [background-size:32px_32px]" />
                    
                    {/* Decorative Elements */}
                    <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

                    <div className="container relative z-10 text-center px-4">
                        <div className="max-w-4xl mx-auto">
                            <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold mb-4 tracking-tight drop-shadow-lg">
                                Ready to surprise someone special?
                            </h2>
                            <p className="text-lg md:text-xl opacity-95 mb-8 max-w-3xl mx-auto font-light leading-relaxed">
                                Don't wait for a special occasion. Make any day memorable with DecorSense.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                <Button 
                                    size="lg" 
                                    variant="secondary" 
                                    className="h-16 rounded-full px-10 text-primary text-lg font-bold shadow-2xl hover:scale-105 hover:shadow-3xl transition-all duration-300 bg-white hover:bg-white/95 group" 
                                    asChild
                                >
                                    <Link href="/shop" className="flex items-center gap-2">
                                        <Gift className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                                        Shop & pay online
                                    </Link>
                                </Button>
                                <Button 
                                    size="lg" 
                                    variant="outline" 
                                    className="h-16 rounded-full px-10 text-lg font-semibold border-2 border-white/40 text-white hover:bg-white/20 hover:border-white/60 bg-white/10 backdrop-blur-sm transition-all duration-300 group" 
                                    asChild
                                >
                                    <Link href="/contact" className="flex items-center gap-2">
                                        Contact us
                                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

            </main>
            <Footer />
        </>
    )
}
