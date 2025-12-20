"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Database } from "@/lib/supabase/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Trash2, Plus, Save, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { ProductImageManager } from "./product-image-manager"

type Product = Database['public']['Tables']['products']['Row']
type Tier = Database['public']['Tables']['product_tiers']['Row']
type Category = Database['public']['Tables']['categories']['Row']

interface ProductFormProps {
    initialData?: Product
    initialTiers?: Tier[]
}

export function ProductForm({ initialData, initialTiers = [] }: ProductFormProps) {
    const router = useRouter()
    const supabase = createClient()
    const [loading, setLoading] = useState(false)
    const [categories, setCategories] = useState<Category[]>([])

    // Form State
    const [name, setName] = useState(initialData?.name || "")
    const [slug, setSlug] = useState(initialData?.slug || "")
    const [categoryId, setCategoryId] = useState(initialData?.category_id || "")
    const [shortDesc, setShortDesc] = useState(initialData?.short_desc || "")
    const [longDesc, setLongDesc] = useState(initialData?.long_desc || "")
    const [pricingType, setPricingType] = useState<string>(initialData?.pricing_type || "FIXED")
    const [isActive, setIsActive] = useState(initialData?.is_active ?? true)
    const [isFeatured, setIsFeatured] = useState(initialData?.is_featured ?? false)
    const [isTrending, setIsTrending] = useState((initialData as any)?.is_trending ?? false)
    const [price, setPrice] = useState(initialData?.price || 0) // Base price if simple

    // Tiers State
    const [tiers, setTiers] = useState<Partial<Tier>[]>(initialTiers)

    useEffect(() => {
        supabase.from('categories').select('*').order('name').then((res: any) => {
            if (res.data) setCategories(res.data)
        })
    }, [])

    // Auto-generate slug
    useEffect(() => {
        if (!initialData && name) {
            setSlug(name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''))
        }
    }, [name, initialData])

    const handleSave = async () => {
        if (!name || !slug) {
            toast.error("Name and Slug are required")
            return
        }

        setLoading(true)

        // 1. Upsert Product
        const productData = {
            name,
            slug,
            category_id: categoryId || null,
            short_desc: shortDesc,
            long_desc: longDesc,
            pricing_type: pricingType as any,
            price: pricingType === 'FIXED' ? Number(price) : null,
            is_active: isActive,
            is_featured: isFeatured,
            is_trending: isTrending,
            updated_at: new Date().toISOString(),
        }

        let productId = initialData?.id

        if (productId) {
            const { error } = await (supabase.from('products') as any).update(productData).eq('id', productId)
            if (error) { toast.error(error.message); setLoading(false); return; }
        } else {
            const { data, error } = await (supabase.from('products') as any).insert(productData).select().single()
            if (error) { toast.error(error.message); setLoading(false); return; }
            productId = data.id
        }

        // 2. Handle Tiers (only if ID exists now)
        if (productId && tiers.length > 0) {
            // For simplicity, delete all existing tiers and re-insert active ones
            // In a real big app we would diff, but this is MVP and safer for ordering

            // Filter out empty ones
            const validTiers = tiers.filter(t => t.name).map((t, idx) => ({
                product_id: productId,
                name: t.name,
                price: Number(t.price),
                inclusions: t.inclusions || [],
                sort_order: idx,
                updated_at: undefined // remove if copied from existing
            })) as any

            if (initialData) {
                // easy way: delete all where product_id
                await (supabase.from('product_tiers') as any).delete().eq('product_id', productId)
            }

            if (validTiers.length > 0) {
                const { error: tierError } = await (supabase.from('product_tiers') as any).insert(validTiers)
                if (tierError) toast.error("Product saved but tiers failed: " + tierError.message)
            }
        } else if (productId && tiers.length === 0 && initialData) {
            // Remove all tiers if empty
            await (supabase.from('product_tiers') as any).delete().eq('product_id', productId)
        }

        toast.success("Product saved successfully")
        router.refresh()
        router.push('/admin/products')
    }

    // Tier Helpers
    const addTier = () => setTiers([...tiers, { name: "", price: 0, inclusions: [] }])
    const removeTier = (index: number) => setTiers(tiers.filter((_, i) => i !== index))
    const updateTier = (index: number, field: string, value: any) => {
        const newTiers = [...tiers]
        newTiers[index] = { ...newTiers[index], [field]: value }
        setTiers(newTiers)
    }

    return (
        <div className="space-y-8 max-w-4xl">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold">{initialData ? "Edit Product" : "New Product"}</h2>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
                    <Button onClick={handleSave} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Product
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* LEFT COLUMN - Main Info */}
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Product Name</Label>
                                <Input value={name} onChange={e => { setName(e.target.value); if (!initialData) setSlug(e.target.value.toLowerCase().replace(/ /g, '-')); }} />
                            </div>
                            <div className="space-y-2">
                                <Label>Slug</Label>
                                <Input value={slug} onChange={e => setSlug(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Category</Label>
                                <Select value={categoryId} onValueChange={setCategoryId}>
                                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                                    <SelectContent>
                                        {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Short Description</Label>
                                <Textarea value={shortDesc} onChange={e => setShortDesc(e.target.value)} rows={3} />
                            </div>
                            <div className="space-y-2">
                                <Label>Long Description (Optional)</Label>
                                <Textarea value={longDesc} onChange={e => setLongDesc(e.target.value)} rows={6} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* PRICING & TIERS */}
                    <Card>
                        <CardHeader><CardTitle>Pricing Configuration</CardTitle></CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Pricing Type</Label>
                                    <Select value={pricingType} onValueChange={setPricingType}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="FIXED">Fixed Price / Standard</SelectItem>
                                            <SelectItem value="RANGE">Price Range (Display Only)</SelectItem>
                                            <SelectItem value="AMOUNT_SERVICE_CHARGE">Service Charge (Money Bouquet)</SelectItem>
                                            <SelectItem value="REQUEST_QUOTE">Request Quote</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                {pricingType === 'FIXED' && (
                                    <div className="space-y-2">
                                        <Label>Base Price (Optional if using Tiers)</Label>
                                        <Input type="number" value={price} onChange={e => setPrice(Number(e.target.value))} />
                                    </div>
                                )}
                            </div>

                            {/* TIERS EDITOR */}
                            <Separator />
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold">Product Tiers / Variants</h3>
                                    <Button type="button" size="sm" variant="secondary" onClick={addTier}><Plus className="mr-2 h-4 w-4" /> Add Tier</Button>
                                </div>

                                {tiers.length === 0 ? (
                                    <p className="text-sm text-muted-foreground bg-muted p-4 rounded-md text-center">No tiers added.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {tiers.map((tier, index) => (
                                            <div key={index} className="flex gap-4 items-start bg-secondary/10 p-4 rounded-md">
                                                <div className="grid gap-2 flex-1">
                                                    <Input
                                                        placeholder="Tier Name (e.g. Classic)"
                                                        value={tier.name}
                                                        onChange={e => updateTier(index, 'name', e.target.value)}
                                                    />
                                                    <Input
                                                        type="number"
                                                        placeholder="Price"
                                                        value={tier.price}
                                                        onChange={e => updateTier(index, 'price', e.target.value)}
                                                    />
                                                    <Textarea
                                                        placeholder="Inclusions (comma separated for now)"
                                                        value={tier.inclusions?.join(', ')}
                                                        onChange={e => updateTier(index, 'inclusions', e.target.value.split(',').map(s => s.trim()))}
                                                        rows={2}
                                                    />
                                                </div>
                                                <Button variant="ghost" size="icon" onClick={() => removeTier(index)} className="text-destructive mt-1">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* RIGHT COLUMN - Settings */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Status</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-2 border rounded-md">
                                <div>
                                    <Label>Active</Label>
                                    <p className="text-xs text-muted-foreground">Product is visible on site</p>
                                </div>
                                <Switch checked={isActive} onCheckedChange={setIsActive} />
                            </div>
                            <div className="flex items-center justify-between p-2 border rounded-md">
                                <div>
                                    <Label>Featured</Label>
                                    <p className="text-xs text-muted-foreground">Show in featured sections</p>
                                </div>
                                <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />
                            </div>
                            <div className="flex items-center justify-between p-2 border rounded-md bg-primary/5">
                                <div>
                                    <Label className="font-semibold">Trending</Label>
                                    <p className="text-xs text-muted-foreground">Show in Trending Packages section</p>
                                </div>
                                <Switch checked={isTrending} onCheckedChange={setIsTrending} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Product Images</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <ProductImageManager productId={initialData?.id} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
