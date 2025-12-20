"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Database } from "@/lib/supabase/types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MOCK_GALLERY } from "@/lib/mock-data"
import { Plus, Trash2, ExternalLink } from "lucide-react"

type GalleryItem = Database['public']['Tables']['gallery_items']['Row']

export default function AdminGallery() {
    const [items, setItems] = useState<GalleryItem[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    const fetchGallery = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase.from('gallery_items').select('*').order('sort_order')
            if (error || !data) throw new Error("API Error")
            setItems(data)
        } catch (e) {
            setItems(MOCK_GALLERY as GalleryItem[])
        }
        setLoading(false)
    }

    useEffect(() => { fetchGallery() }, [])

    return (
        <div className="flex-1 p-4 md:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
                <h1 className="text-2xl md:text-3xl font-bold">Gallery Management</h1>
                <Button className="w-full sm:w-auto">
                    <Plus className="mr-2 h-4 w-4" /> Add Item
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {items.map((item) => (
                    <Card key={item.id} className="overflow-hidden group">
                        <div className="relative aspect-square bg-muted">
                            {item.media_type === 'image' ? (
                                <img src={item.url} alt="Gallery" className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex items-center justify-center w-full h-full bg-black text-white">Video</div>
                            )}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <Button variant="secondary" size="icon">
                                    <ExternalLink className="h-4 w-4" />
                                </Button>
                                <Button variant="destructive" size="icon">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-semibold truncate block flex-1 mr-2">{item.caption || "No Caption"}</span>
                                <Badge variant={item.is_active ? 'default' : 'secondary'}>{item.is_active ? 'Active' : 'Hidden'}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">Order: {item.sort_order}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {loading && <p className="text-center text-muted-foreground mt-8">Loading...</p>}
        </div>
    )
}
