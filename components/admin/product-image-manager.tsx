"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2, Upload, X, GripVertical } from "lucide-react"
import { toast } from "sonner"
import { Database } from "@/lib/supabase/types"

type ProductImage = Database['public']['Tables']['product_images']['Row']

interface ProductImageManagerProps {
    productId?: string
}

export function ProductImageManager({ productId }: ProductImageManagerProps) {
    const supabase = createClient()
    const [images, setImages] = useState<ProductImage[]>([])
    const [uploading, setUploading] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (productId) {
            loadImages()
        } else {
            setLoading(false)
        }
    }, [productId])

    const loadImages = async () => {
        if (!productId) return
        
        setLoading(true)
        const { data, error } = await (supabase
            .from('product_images') as any)
            .select('*')
            .eq('product_id', productId)
            .order('sort_order')

        if (error) {
            toast.error(`Failed to load images: ${error.message}`)
        } else {
            setImages(data || [])
        }
        setLoading(false)
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!productId) {
            toast.error("Please save the product first before uploading images")
            return
        }

        const files = e.target.files
        if (!files || files.length === 0) return

        setUploading(true)

        try {
            for (const file of Array.from(files)) {
                // Validate file type
                if (!file.type.startsWith('image/')) {
                    toast.error(`${file.name} is not an image file`)
                    continue
                }

                // Validate file size (max 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    toast.error(`${file.name} is too large. Max size is 5MB`)
                    continue
                }

                // Generate unique filename
                const fileExt = file.name.split('.').pop()
                const fileName = `${productId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
                const filePath = `product-images/${fileName}`

                // Upload to Supabase Storage
                const { error: uploadError } = await supabase.storage
                    .from('product-images')
                    .upload(filePath, file, {
                        cacheControl: '3600',
                        upsert: false
                    })

                if (uploadError) {
                    toast.error(`Failed to upload ${file.name}: ${uploadError.message}`)
                    continue
                }

                // Get public URL
                const { data: urlData } = supabase.storage
                    .from('product-images')
                    .getPublicUrl(filePath)

                // Insert image record
                const nextSortOrder = images.length > 0 
                    ? Math.max(...images.map(img => img.sort_order)) + 1 
                    : 0

                const { error: insertError } = await (supabase
                    .from('product_images') as any)
                    .insert({
                        product_id: productId,
                        url: urlData.publicUrl,
                        sort_order: nextSortOrder
                    })

                if (insertError) {
                    toast.error(`Failed to save image record: ${insertError.message}`)
                    // Try to delete uploaded file
                    await supabase.storage.from('product-images').remove([filePath])
                } else {
                    toast.success(`${file.name} uploaded successfully`)
                }
            }

            // Reload images
            await loadImages()
        } catch (error: any) {
            toast.error(`Upload failed: ${error.message}`)
        } finally {
            setUploading(false)
            // Reset input
            e.target.value = ''
        }
    }

    const handleDelete = async (imageId: string, imageUrl: string) => {
        if (!confirm('Are you sure you want to delete this image?')) return

        try {
            // Extract file path from URL
            const urlParts = imageUrl.split('/product-images/')
            const filePath = urlParts.length > 1 ? `product-images/${urlParts[1]}` : null

            // Delete from database
            const { error: dbError } = await (supabase
                .from('product_images') as any)
                .delete()
                .eq('id', imageId)

            if (dbError) throw dbError

            // Delete from storage if path is available
            if (filePath) {
                await supabase.storage.from('product-images').remove([filePath])
            }

            toast.success('Image deleted successfully')
            await loadImages()
        } catch (error: any) {
            toast.error(`Failed to delete image: ${error.message}`)
        }
    }

    const handleSortOrderChange = async (imageId: string, newSortOrder: number) => {
        const { error } = await (supabase
            .from('product_images') as any)
            .update({ sort_order: newSortOrder })
            .eq('id', imageId)

        if (error) {
            toast.error(`Failed to update order: ${error.message}`)
        } else {
            await loadImages()
        }
    }

    if (!productId) {
        return (
            <div className="p-4 border border-dashed rounded-lg text-center text-sm text-muted-foreground">
                Save the product first to upload images
            </div>
        )
    }

    if (loading) {
        return <div className="text-sm text-muted-foreground">Loading images...</div>
    }

    return (
        <div className="space-y-4">
            {/* Upload Button */}
            <div>
                <Label htmlFor="image-upload" className="cursor-pointer">
                    <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg hover:border-primary/50 transition-colors">
                        <div className="text-center">
                            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-sm font-medium">Click to upload images</p>
                            <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
                        </div>
                    </div>
                </Label>
                <Input
                    id="image-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="hidden"
                />
            </div>

            {/* Image Grid */}
            {images.length > 0 && (
                <div className="space-y-2">
                    <Label className="text-sm font-medium">Uploaded Images ({images.length})</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {images
                            .sort((a, b) => a.sort_order - b.sort_order)
                            .map((image, index) => (
                                <div key={image.id} className="relative group">
                                    <div className="aspect-square rounded-lg overflow-hidden border-2 border-muted bg-muted">
                                        <img
                                            src={image.url}
                                            alt={`Product image ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => handleDelete(image.id, image.url)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                                        <GripVertical className="h-3 w-3" />
                                        <span>Order: {image.sort_order}</span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-5 px-1 text-xs ml-auto"
                                            onClick={() => handleSortOrderChange(image.id, image.sort_order - 1)}
                                            disabled={index === 0}
                                        >
                                            ↑
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-5 px-1 text-xs"
                                            onClick={() => handleSortOrderChange(image.id, image.sort_order + 1)}
                                            disabled={index === images.length - 1}
                                        >
                                            ↓
                                        </Button>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            )}

            {uploading && (
                <div className="text-sm text-muted-foreground text-center py-4">
                    Uploading images...
                </div>
            )}
        </div>
    )
}



