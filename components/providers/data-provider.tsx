"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Database } from "@/lib/supabase/types"
import { toast } from "sonner"

type Category = Database['public']['Tables']['categories']['Row']
type Product = Database['public']['Tables']['products']['Row']
type Settings = Database['public']['Tables']['site_settings']['Row']

interface DataContextType {
    categories: Category[]
    products: Product[]
    settings: Settings | null
    loading: boolean
    refresh: () => Promise<void>
}

const DataContext = createContext<DataContextType>({
    categories: [],
    products: [],
    settings: null,
    loading: true,
    refresh: async () => { },
})

export const useData = () => useContext(DataContext)

export function DataProvider({ children }: { children: React.ReactNode }) {
    const [categories, setCategories] = useState<Category[]>([])
    const [products, setProducts] = useState<Product[]>([])
    const [settings, setSettings] = useState<Settings | null>(null)
    const [loading, setLoading] = useState(true)

    const supabase = createClient()

    const fetchData = async () => {
        try {
            const [catRes, prodRes, imgRes, setRes] = await Promise.all([
                (supabase.from('categories') as any).select('*').order('sort_order'),
                (supabase.from('products') as any).select('*').order('created_at', { ascending: false }),
                (supabase.from('product_images') as any).select('*').order('sort_order'),
                (supabase.from('site_settings') as any).select('*').single(),
            ])

            if (catRes.error || prodRes.error || setRes.error) {
                console.warn("Supabase returned error (likely invalid keys). Using Mock Data.")
                throw new Error("Supabase fetch failed")
            }

            if (catRes.data) setCategories(catRes.data)
            
            // Attach images to products
            if (prodRes.data && imgRes.data) {
                const productsWithImages = prodRes.data.map((product: any) => ({
                    ...product,
                    images: imgRes.data
                        ?.filter((img: any) => img.product_id === product.id)
                        .map((img: any) => img.url) || []
                }))
                setProducts(productsWithImages as any)
            } else if (prodRes.data) {
                setProducts(prodRes.data)
            }
            
            if (setRes.data) setSettings(setRes.data)

        } catch (error) {
            console.error("Using Mock Data due to error:", error)
            // MOCK DATA FALLBACK - Matching the required homepage categories
            setCategories([
                { id: '2', name: 'Fresh Flowers', slug: 'fresh-flowers', sort_order: 2, is_active: true, created_at: '', updated_at: '', is_featured: true, image_url: '/hero-bg.png', description: 'Beautiful fresh blooms for every occasion.' },
                { id: '3', name: 'Faux & Artificial Flowers', slug: 'faux-flowers', sort_order: 3, is_active: true, created_at: '', updated_at: '', is_featured: true, image_url: '/hero-bg-2.png', description: 'Long-lasting premium artificial flowers.' },
                { id: '4', name: 'Gift Box Packages (For Her)', slug: 'gift-boxes-her', sort_order: 4, is_active: true, created_at: '', updated_at: '', is_featured: true, image_url: '/hero-bg-3.png', description: 'Curated gift boxes she will adore.' },
                { id: '5', name: 'Gift Box Packages (For Him)', slug: 'gift-boxes-him', sort_order: 5, is_active: true, created_at: '', updated_at: '', is_featured: true, image_url: '/hero-bg-3.png', description: 'Sophisticated gift boxes for him.' },
                { id: '6', name: 'Hot Air Balloon Treat Boxes', slug: 'balloon-treats', sort_order: 6, is_active: true, created_at: '', updated_at: '', is_featured: true, image_url: '/gallery-balloons.png', description: 'Trendy hot air balloon style gift boxes.' },
                { id: '7', name: 'Room Decoration', slug: 'room-decor', sort_order: 7, is_active: true, created_at: '', updated_at: '', is_featured: true, image_url: '/product-room-decor.png', description: 'Transform any space with our decor packages.' },
                { id: '8', name: 'Surprise Packages', slug: 'surprise-packages', sort_order: 8, is_active: true, created_at: '', updated_at: '', is_featured: true, image_url: '/hero-bg-3.png', description: 'The ultimate surprise delivery experience.' },
            ])
            // Mock products matching the seed structure
            setProducts([
                // FRESH FLOWERS CATEGORY (category_id: '2')
                {
                    id: 'b0000000-0000-0000-0002-000000000001', name: 'Mixed Flowers', slug: 'mixed-flowers',
                    category_id: '2', price: 450, pricing_type: 'FIXED',
                    short_desc: 'Beautiful mixed flower arrangements with various stems.', long_desc: '',
                    is_active: true, is_featured: true, is_trending: false, created_at: '', updated_at: '',
                    price_min: 450, price_max: 4000, currency: 'GHS', tags: [],
                },
                {
                    id: 'b0000000-0000-0000-0002-000000000002', name: 'Roses', slug: 'roses',
                    category_id: '2', price: 300, pricing_type: 'FIXED',
                    short_desc: 'Premium fresh roses arranged with filler flowers and greeneries.', long_desc: '',
                    is_active: true, is_featured: true, is_trending: false, created_at: '', updated_at: '',
                    price_min: 300, price_max: 4850, currency: 'GHS', tags: [],
                },
                {
                    id: 'b0000000-0000-0000-0002-000000000003', name: 'Rose Arrangements (Box/Vase/Baskets)', slug: 'rose-arrangements',
                    category_id: '2', price: 1000, pricing_type: 'FIXED',
                    short_desc: 'Roses arranged with filler flowers and greeneries in boxes, vases, or baskets.', long_desc: '',
                    is_active: true, is_featured: false, is_trending: false, created_at: '', updated_at: '',
                    price_min: 1000, price_max: 2500, currency: 'GHS', tags: [],
                },
                {
                    id: 'b0000000-0000-0000-0002-000000000004', name: 'Mixed Flower Arrangements', slug: 'mixed-flower-arrangements',
                    category_id: '2', price: 750, pricing_type: 'FIXED',
                    short_desc: 'Mixed flowers arranged with spray roses, chrysanthemums, gypso, ruscus, lisiathus, lilies etc.', long_desc: '',
                    is_active: true, is_featured: false, is_trending: false, created_at: '', updated_at: '',
                    price_min: 750, price_max: 2000, currency: 'GHS', tags: [],
                },
                {
                    id: 'b0000000-0000-0000-0002-000000000005', name: 'Bridal Arrangements', slug: 'bridal-arrangements',
                    category_id: '2', price: 550, pricing_type: 'FIXED',
                    short_desc: 'Elegant bridal flower arrangements for your special day.', long_desc: '',
                    is_active: true, is_featured: false, is_trending: false, created_at: '', updated_at: '',
                    price_min: 550, price_max: 1000, currency: 'GHS', tags: [],
                },
                // FAUX & ARTIFICIAL FLOWERS (category_id: '3')
                {
                    id: 'b0000000-0000-0000-0003-000000000001', name: 'Faux / Velvet Flowers', slug: 'faux-velvet-flowers',
                    category_id: '3', price: 350, pricing_type: 'FIXED',
                    short_desc: 'Looks and feel like natural flowers.', long_desc: '',
                    is_active: true, is_featured: true, is_trending: false, created_at: '', updated_at: '',
                    price_min: 350, price_max: 2500, currency: 'GHS', tags: [],
                },
                {
                    id: 'b0000000-0000-0000-0003-000000000002', name: 'Artificial Bouquets (Satin Rose)', slug: 'artificial-satin-bouquets',
                    category_id: '3', price: 250, pricing_type: 'FIXED',
                    short_desc: 'Satin rose flowers arranged beautifully.', long_desc: '',
                    is_active: true, is_featured: false, is_trending: false, created_at: '', updated_at: '',
                    price_min: 250, price_max: 2200, currency: 'GHS', tags: [],
                },
                {
                    id: 'b0000000-0000-0000-0003-000000000003', name: 'Mixed Artificial Flowers', slug: 'mixed-artificial-flowers',
                    category_id: '3', price: 350, pricing_type: 'FIXED',
                    short_desc: 'Beautiful mixed artificial flower arrangements.', long_desc: '',
                    is_active: true, is_featured: false, is_trending: false, created_at: '', updated_at: '',
                    price_min: 350, price_max: 1200, currency: 'GHS', tags: [],
                },
                // GIFT BOXES FOR HER (category_id: '4')
                {
                    id: 'b0000000-0000-0000-0004-000000000001', name: 'Birthday Gift Box Packages For Her', slug: 'gift-box-her',
                    category_id: '4', price: 450, pricing_type: 'FIXED',
                    short_desc: 'Curated gift boxes designed especially for her special day.', long_desc: '',
                    is_active: true, is_featured: true, is_trending: false, created_at: '', updated_at: '',
                    price_min: 450, price_max: 2000, currency: 'GHS', tags: [],
                },
                // GIFT BOXES FOR HIM (category_id: '5')
                {
                    id: 'b0000000-0000-0000-0005-000000000001', name: 'Birthday Gift Box Packages For Him', slug: 'gift-box-him',
                    category_id: '5', price: 500, pricing_type: 'FIXED',
                    short_desc: 'Sophisticated gift boxes designed especially for him.', long_desc: '',
                    is_active: true, is_featured: false, is_trending: false, created_at: '', updated_at: '',
                    price_min: 500, price_max: 2500, currency: 'GHS', tags: [],
                },
                // HOT AIR BALLOON TREAT BOXES (category_id: '6')
                {
                    id: 'b0000000-0000-0000-0006-000000000001', name: 'Hot Air Balloon Treat Bouquet Packages', slug: 'balloon-treat-bouquet',
                    category_id: '6', price: 300, pricing_type: 'FIXED',
                    short_desc: 'Trendy hot air balloon style treat boxes with personalized balloons and treats.', long_desc: '',
                    is_active: true, is_featured: true, is_trending: false, created_at: '', updated_at: '',
                    price_min: 300, price_max: 750, currency: 'GHS', tags: [],
                },
                // ROOM DECORATION (category_id: '7')
                {
                    id: 'b0000000-0000-0000-0007-000000000001', name: 'Room Decoration Packages', slug: 'room-decoration',
                    category_id: '7', price: 1000, pricing_type: 'FIXED',
                    short_desc: 'Transform any space with our premium room decoration packages.', long_desc: '',
                    is_active: true, is_featured: true, is_trending: false, created_at: '', updated_at: '',
                    price_min: 1000, price_max: 5500, currency: 'GHS', tags: [],
                },
                // SURPRISE PACKAGES (category_id: '8')
                {
                    id: 'b0000000-0000-0000-0008-000000000001', name: 'Surprise Packages', slug: 'surprise-packages',
                    category_id: '8', price: 1000, pricing_type: 'FIXED',
                    short_desc: 'The ultimate surprise delivery experience with saxophone, party poppers, and more.', long_desc: '',
                    is_active: true, is_featured: true, is_trending: false, created_at: '', updated_at: '',
                    price_min: 1000, price_max: 3000, currency: 'GHS', tags: [],
                },
            ])
            setSettings({
                id: '1', business_name: 'DecorSense Gifts',
                phone: '0245131057', whatsapp_link: 'https://wa.me/233245131057',
                address: 'Adenta, Ghana', socials: {}, seo_defaults: {},
                service_areas: [], home_sections: {}
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()

        // Realtime subscriptions - subscribe to all relevant tables
        const channel = supabase
            .channel('schema-db-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => fetchData())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => fetchData())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'product_tiers' }, () => fetchData())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'product_price_rows' }, () => fetchData())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'product_images' }, () => fetchData())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'addons' }, () => fetchData())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings' }, () => fetchData())
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    return (
        <DataContext.Provider value={{ categories, products, settings, loading, refresh: fetchData }}>
            {children}
        </DataContext.Provider>
    )
}
