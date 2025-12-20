"use client"

import { useState, useMemo, Suspense } from "react"
import { MainNav } from "@/components/layout/main-nav"
import { Footer } from "@/components/layout/footer"
import { useData } from "@/components/providers/data-provider"
import { ProductCard } from "@/components/shop/product-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, SlidersHorizontal } from "lucide-react"
import { useSearchParams } from "next/navigation"

function ShopPageContent() {
    const { products, categories, loading } = useData()
    const searchParams = useSearchParams()
    const initialCategory = searchParams.get('category')

    const [search, setSearch] = useState("")
    const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory)

    // Filter Logic
    const filteredProducts = useMemo(() => {
        let result = products.filter(p => p.is_active)

        if (selectedCategory) {
            // Handle combined "Gift Box Packages" category
            if (selectedCategory === 'gift-boxes') {
                const giftBoxHer = categories.find(c => c.slug === 'gift-boxes-her')
                const giftBoxHim = categories.find(c => c.slug === 'gift-boxes-him')
                const giftBoxIds = [giftBoxHer?.id, giftBoxHim?.id].filter(Boolean) as string[]
                result = result.filter(p => p.category_id && giftBoxIds.includes(p.category_id))
            } else {
                // Find category ID from slug
                const cat = categories.find(c => c.slug === selectedCategory)
                if (cat) {
                    result = result.filter(p => p.category_id === cat.id)
                }
            }
        }

        if (search) {
            const q = search.toLowerCase()
            result = result.filter(p =>
                p.name.toLowerCase().includes(q) ||
                p.tags?.some(t => t.toLowerCase().includes(q))
            )
        }

        return result
    }, [products, categories, selectedCategory, search])

    return (
        <>
            <MainNav />
            <main className="container py-12">
                <div className="flex flex-col md:flex-row items-baseline justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Shop Packages</h1>
                        <p className="text-muted-foreground">Find the perfect gift or decoration.</p>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search packages..."
                                className="pl-9"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
                    {/* Filters Sidebar */}
                    <aside className="space-y-6">
                        <div>
                            <h3 className="font-semibold mb-4 flex items-center gap-2">
                                <SlidersHorizontal size={18} /> Categories
                            </h3>
                            <div className="space-y-1">
                                <Button
                                    variant={selectedCategory === null ? "secondary" : "ghost"}
                                    className="w-full justify-start"
                                    onClick={() => setSelectedCategory(null)}
                                >
                                    All Categories
                                </Button>
                                {categories.filter(c => c.is_active).map(cat => (
                                    <Button
                                        key={cat.id}
                                        variant={selectedCategory === cat.slug ? "secondary" : "ghost"}
                                        className="w-full justify-start text-sm"
                                        onClick={() => setSelectedCategory(cat.slug)}
                                    >
                                        {cat.name}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </aside>

                    {/* Product Grid */}
                    <div>
                        {loading ? (
                            <div className="py-20 text-center text-muted-foreground">Loading products...</div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="py-20 text-center border rounded-xl bg-muted/20">
                                <p className="text-lg font-medium">No products found</p>
                                <p className="text-sm text-muted-foreground">Try adjusting your filters.</p>
                                <Button variant="link" onClick={() => { setSearch(""); setSelectedCategory(null) }}>Clear Filters</Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredProducts.map(product => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </>
    )
}

export default function ShopPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ShopPageContent />
        </Suspense>
    )
}
