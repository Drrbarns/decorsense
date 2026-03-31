"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Database } from "@/lib/supabase/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, Edit2, Trash2, Eye, EyeOff, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { toast } from "sonner"

type Product = Database['public']['Tables']['products']['Row'] & {
    categories: Database['public']['Tables']['categories']['Row'] | null
}

import { MOCK_PRODUCTS } from "@/lib/mock-data"

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const supabase = createClient()

    const fetchProducts = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('products')
                .select(`
                *,
                categories (name)
              `)
                .order('created_at', { ascending: false })

            if (error || !data) throw new Error("API Error")
            setProducts(data as Product[])
        } catch (e) {
            setProducts(MOCK_PRODUCTS as any)
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchProducts()
    }, [])

    const toggleActive = async (id: string, current: boolean) => {
        const nextValue = !current
        setProducts(products.map(p => p.id === id ? { ...p, is_active: nextValue } : p))

        const { error } = await (supabase.from('products') as any)
            .update({ is_active: nextValue })
            .eq('id', id)

        if (error) {
            setProducts(products.map(p => p.id === id ? { ...p, is_active: current } : p))
            toast.error(`Failed to update status: ${error.message}`)
            return
        }

        toast.success(`Product ${nextValue ? 'activated' : 'deactivated'}`)
    }

    const toggleFlag = async (id: string, field: 'is_featured' | 'is_trending', current: boolean) => {
        const nextValue = !current
        setProducts(products.map(p => p.id === id ? { ...p, [field]: nextValue } : p))

        const { error } = await (supabase.from('products') as any)
            .update({ [field]: nextValue })
            .eq('id', id)

        if (error) {
            setProducts(products.map(p => p.id === id ? { ...p, [field]: current } : p))
            toast.error(`Failed to update ${field === 'is_featured' ? 'featured' : 'trending'}: ${error.message}`)
            return
        }

        toast.success(`${field === 'is_featured' ? 'Featured' : 'Trending'} ${nextValue ? 'enabled' : 'disabled'}`)
    }

    // Frontend filter
    const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))

    return (
        <>
            <div className="flex-1 p-4 md:p-6 lg:p-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
                    <h1 className="text-2xl md:text-3xl font-bold">Products Management</h1>
                    <Button asChild className="w-full sm:w-auto">
                        <Link href="/admin/products/new"><Plus className="mr-2 h-4 w-4" /> Add Product</Link>
                    </Button>
                </div>

                <div className="bg-card border rounded-lg overflow-hidden">
                    <div className="p-3 md:p-4 border-b">
                        <div className="relative w-full">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search products..."
                                className="pl-9"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left min-w-[600px]">
                            <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
                                <tr>
                                    <th className="px-3 md:px-6 py-2 md:py-3">Name</th>
                                    <th className="px-3 md:px-6 py-2 md:py-3 hidden sm:table-cell">Category</th>
                                    <th className="px-3 md:px-6 py-2 md:py-3 hidden md:table-cell">Pricing Type</th>
                                    <th className="px-3 md:px-6 py-2 md:py-3">Status</th>
                                    <th className="px-3 md:px-6 py-2 md:py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={5} className="px-6 py-8 text-center">Loading...</td></tr>
                                ) : filtered.length === 0 ? (
                                    <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No products found.</td></tr>
                                ) : (
                                    filtered.map((product) => (
                                        <tr key={product.id} className="border-b hover:bg-muted/50 transition-colors">
                                            <td className="px-3 md:px-6 py-3 md:py-4 font-medium">
                                                <div className="flex items-center gap-2">
                                                    <span>{product.name}</span>
                                                    {product.is_trending && (
                                                        <Badge
                                                            variant="default"
                                                            className="bg-primary text-primary-foreground text-xs px-2 py-0.5 flex items-center gap-1 cursor-pointer"
                                                            onClick={() => toggleFlag(product.id, 'is_trending', product.is_trending)}
                                                            title="Toggle trending"
                                                        >
                                                            <TrendingUp className="h-3 w-3" />
                                                            <span className="hidden sm:inline">Trending</span>
                                                        </Badge>
                                                    )}
                                                    {product.is_featured && (
                                                        <Badge
                                                            variant="secondary"
                                                            className="text-xs px-2 py-0.5 cursor-pointer"
                                                            onClick={() => toggleFlag(product.id, 'is_featured', product.is_featured)}
                                                            title="Toggle featured"
                                                        >
                                                            Featured
                                                        </Badge>
                                                    )}
                                                    {!product.is_featured && !product.is_trending && (
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-6 text-xs"
                                                                onClick={() => toggleFlag(product.id, 'is_featured', product.is_featured)}
                                                            >
                                                                Mark Featured
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-6 text-xs"
                                                                onClick={() => toggleFlag(product.id, 'is_trending', product.is_trending)}
                                                            >
                                                                Mark Trending
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-xs text-muted-foreground sm:hidden mt-1">{product.categories?.name || "Uncategorized"}</div>
                                            </td>
                                            <td className="px-3 md:px-6 py-3 md:py-4 hidden sm:table-cell">{product.categories?.name || "Uncategorized"}</td>
                                            <td className="px-3 md:px-6 py-3 md:py-4 hidden md:table-cell">
                                                <span className="inline-flex px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                                                    {product.pricing_type}
                                                </span>
                                            </td>
                                            <td className="px-3 md:px-6 py-3 md:py-4">
                                                <button onClick={() => toggleActive(product.id, product.is_active)} title="Toggle Status" className="text-xs sm:text-sm">
                                                    {product.is_active ?
                                                        <span className="flex items-center text-green-600"><Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1" /> <span className="hidden sm:inline">Active</span></span> :
                                                        <span className="flex items-center text-muted-foreground"><EyeOff className="w-3 h-3 sm:w-4 sm:h-4 mr-1" /> <span className="hidden sm:inline">Hidden</span></span>
                                                    }
                                                </button>
                                            </td>
                                            <td className="px-3 md:px-6 py-3 md:py-4 text-right">
                                                <div className="flex items-center justify-end gap-1 md:gap-2">
                                                    <Button variant="ghost" size="icon" asChild className="h-8 w-8 md:h-10 md:w-10">
                                                        <Link href={`/admin/products/${product.id}`}><Edit2 className="h-3 w-3 md:h-4 md:w-4" /></Link>
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 md:h-10 md:w-10">
                                                        <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    )
}
