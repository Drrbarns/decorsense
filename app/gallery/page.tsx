"use client"

import { useState, useEffect } from "react"
import { MainNav } from "@/components/layout/main-nav"
import { Footer } from "@/components/layout/footer"
import { createClient } from "@/lib/supabase/client"
import { Database } from "@/lib/supabase/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { PlayCircle } from "lucide-react"

type GalleryItem = Database['public']['Tables']['gallery_items']['Row']

export default function GalleryPage() {
    const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null)
    // We need to fetch gallery items. They are not in DataProvider yet.
    // Let's create a local fetch or expand DataProvider. 
    // For now, let's just fetch client side here since it's a specific page.

    const [items, setItems] = useState<GalleryItem[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const supabase = createClient()

        async function fetchGallery() {
            try {
                const { data, error } = await supabase.from('gallery_items').select('*').order('sort_order', { ascending: true })
                if (error || !data || data.length === 0) throw new Error("No data")
                setItems(data)
            } catch (e) {
                // Mock Data Fallback
                console.log("Using Mock Gallery Data")
                const MOCK_GALLERY: GalleryItem[] = [
                    { id: '1', media_type: 'image', url: '/gallery-hamper.png', caption: 'Luxury Christmas Hamper', is_active: true, sort_order: 1, title: null },
                    { id: '2', media_type: 'image', url: '/gallery-balloons.png', caption: 'Luxury Balloon Decor', is_active: true, sort_order: 2, title: null },
                    { id: '3', media_type: 'image', url: '/hero-bg-2.png', caption: 'Gold & Red Money Bouquet', is_active: true, sort_order: 3, title: null },
                    { id: '4', media_type: 'image', url: '/product-room-decor.png', caption: 'Romantic Proposal Setup', is_active: true, sort_order: 4, title: null },
                    { id: '5', media_type: 'image', url: '/hero-bg.png', caption: 'Premium Roses Box', is_active: true, sort_order: 5, title: null },
                ]
                setItems(MOCK_GALLERY)
            } finally {
                setLoading(false)
            }
        }

        fetchGallery()

        // Realtime subscription
        const channel = supabase
            .channel('gallery-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'gallery_items' }, () => {
                fetchGallery()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    // Filter types
    const images = items.filter(i => i.media_type === 'image' && i.is_active)
    const videos = items.filter(i => i.media_type === 'video' && i.is_active)

    return (
        <>
            <MainNav />
            <main className="container py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4">Our Gallery</h1>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Explore our past work, from breathtaking money towers to romantic room setups.
                    </p>
                </div>

                <Tabs defaultValue="all" className="w-full">
                    <div className="flex justify-center mb-8">
                        <TabsList>
                            <TabsTrigger value="all">All Media</TabsTrigger>
                            <TabsTrigger value="images">Photos</TabsTrigger>
                            <TabsTrigger value="videos">Videos</TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="all" className="mt-0">
                        <MasonryGrid items={[...images, ...videos]} setSelected={setSelectedItem} loading={loading} />
                    </TabsContent>
                    <TabsContent value="images" className="mt-0">
                        <MasonryGrid items={images} setSelected={setSelectedItem} loading={loading} />
                    </TabsContent>
                    <TabsContent value="videos" className="mt-0">
                        <MasonryGrid items={videos} setSelected={setSelectedItem} loading={loading} />
                    </TabsContent>
                </Tabs>

                {/* Lightbox Dialog */}
                <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
                    <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black/95 border-none text-white">
                        {selectedItem && (
                            <div className="relative flex flex-col items-center justify-center p-4">
                                {selectedItem.media_type === 'image' ? (
                                    <img src={selectedItem.url} alt={selectedItem.caption || "Gallery"} className="max-h-[85vh] w-auto object-contain" />
                                ) : (
                                    <video src={selectedItem.url} controls className="max-h-[85vh] w-full" autoPlay />
                                )}
                                {selectedItem.caption && (
                                    <p className="mt-4 text-center text-sm opacity-90">{selectedItem.caption}</p>
                                )}
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

            </main>
            <Footer />
        </>
    )
}

function MasonryGrid({ items, setSelected, loading }: { items: GalleryItem[], setSelected: (i: GalleryItem) => void, loading: boolean }) {
    if (loading) {
        return <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-64 rounded-lg" />)}
        </div>
    }

    if (items.length === 0) return <div className="text-center py-20 text-muted-foreground">Gallery is empty.</div>

    return (
        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {items.map((item) => (
                <div
                    key={item.id}
                    className="break-inside-avoid relative group cursor-pointer rounded-lg overflow-hidden bg-muted"
                    onClick={() => setSelected(item)}
                >
                    {item.media_type === 'image' ? (
                        <img src={item.url} alt={item.caption || ""} className="w-full h-auto transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                        <div className="relative">
                            <video src={item.url} className="w-full h-auto" />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                                <PlayCircle size={48} className="text-white opacity-80" />
                            </div>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                        <p className="text-white text-sm font-medium line-clamp-2">{item.caption}</p>
                    </div>
                </div>
            ))}
        </div>
    )
}
