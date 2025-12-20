"use client"

import { useEffect, useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Database } from "@/lib/supabase/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Edit2, Lock, Plus, Save, Upload, X, Loader2 } from "lucide-react"
import { toast } from "sonner"

type Category = Database['public']['Tables']['categories']['Row']
type CategoryInsert = Database['public']['Tables']['categories']['Insert']

import { MOCK_CATEGORIES } from "@/lib/mock-data"

export default function AdminCategories() {
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [editing, setEditing] = useState<Category | null>(null)
    const [uploadingImage, setUploadingImage] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // New Category State
    const [isNewOpen, setIsNewOpen] = useState(false)
    const [newName, setNewName] = useState("")
    const [newSlug, setNewSlug] = useState("")
    const [newImageUrl, setNewImageUrl] = useState("")

    const supabase = createClient()

    const fetchCats = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase.from('categories').select('*').order('sort_order')
            if (error || !data) throw new Error("API Error")
            setCategories(data)
        } catch (e) {
            setCategories(MOCK_CATEGORIES as Category[])
        }
        setLoading(false)
    }

    useEffect(() => { fetchCats() }, [])

    const handleImageUpload = async (file: File, categoryId?: string) => {
        if (!file.type.startsWith('image/')) {
            toast.error("Please select an image file")
            return null
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image size must be less than 5MB")
            return null
        }

        const uploadId = categoryId || 'new'
        setUploadingImage(uploadId)

        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `category-${categoryId || 'new'}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
            const filePath = `category-images/${fileName}`

            // Upload to Supabase Storage (using product-images bucket)
            const { error: uploadError } = await supabase.storage
                .from('product-images')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                })

            if (uploadError) {
                throw new Error(uploadError.message)
            }

            const { data: urlData } = supabase.storage
                .from('product-images')
                .getPublicUrl(filePath)

            setUploadingImage(null)
            return urlData.publicUrl
        } catch (error: any) {
            setUploadingImage(null)
            toast.error(`Failed to upload image: ${error.message}`)
            return null
        }
    }

    const handleCreate = async () => {
        if (!newName || !newSlug) return

        const insertData: CategoryInsert = { 
            name: newName, 
            slug: newSlug,
            image_url: newImageUrl || null
        }

        const { error } = await supabase.from('categories').insert(insertData)

        if (error) {
            toast.error(error.message)
        } else {
            toast.success("Category created")
            setIsNewOpen(false)
            setNewName("")
            setNewSlug("")
            setNewImageUrl("")
            fetchCats()
        }
    }

    const handleUpdate = async () => {
        if (!editing) return

        const { error } = await supabase
            .from('categories')
            .update({
                name: editing.name,
                slug: editing.slug,
                sort_order: editing.sort_order,
                image_url: editing.image_url,
                description: editing.description,
                is_featured: editing.is_featured,
                is_active: editing.is_active,
                updated_at: new Date().toISOString()
            })
            .eq('id', editing.id)

        if (error) {
            toast.error(error.message)
        } else {
            toast.success("Category updated")
            setEditing(null)
            fetchCats()
        }
    }

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>, categoryId?: string) => {
        const file = e.target.files?.[0]
        if (!file) return

        const imageUrl = await handleImageUpload(file, categoryId)
        if (imageUrl) {
            if (categoryId && editing) {
                setEditing({ ...editing, image_url: imageUrl })
            } else {
                setNewImageUrl(imageUrl)
            }
        }
        // Reset input
        if (e.target) e.target.value = ''
    }

    return (
        <>
            <div className="flex-1 p-4 md:p-6 lg:p-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold">Categories</h1>
                    <Dialog open={isNewOpen} onOpenChange={setIsNewOpen}>
                        <DialogTrigger asChild><Button className="w-full sm:w-auto"><Plus className="mr-1 h-4 w-4" /> New Category</Button></DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader><DialogTitle>Create Category</DialogTitle></DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Name</Label>
                                    <Input value={newName} onChange={e => { setNewName(e.target.value); setNewSlug(e.target.value.toLowerCase().replace(/ /g, '-')) }} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Slug</Label>
                                    <Input value={newSlug} onChange={e => setNewSlug(e.target.value)} />
                                </div>
                                
                                {/* Image Upload */}
                                <div className="space-y-2">
                                    <Label>Category Image</Label>
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                        {newImageUrl ? (
                                            <div className="relative">
                                                <img src={newImageUrl} alt="Preview" className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-lg border" />
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    className="absolute -top-2 -right-2 h-6 w-6"
                                                    onClick={() => setNewImageUrl("")}
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="w-24 h-24 sm:w-32 sm:h-32 border-2 border-dashed rounded-lg flex items-center justify-center bg-muted flex-shrink-0">
                                                {uploadingImage === 'new' ? (
                                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                                ) : (
                                                    <Upload className="h-6 w-6 text-muted-foreground" />
                                                )}
                                            </div>
                                        )}
                                        <div className="flex-1 w-full sm:w-auto">
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleImageChange(e)}
                                                disabled={uploadingImage === 'new'}
                                                className="cursor-pointer"
                                            />
                                            <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
                                        </div>
                                    </div>
                                </div>

                                <Button onClick={handleCreate} className="w-full" disabled={uploadingImage === 'new'}>Create</Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="grid gap-3 md:gap-4">
                    {categories.map((cat) => (
                        <Card key={cat.id}>
                            <CardContent className="p-3 md:p-4">
                                {editing?.id === cat.id ? (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                                            <div className="space-y-1">
                                                <Label>Name</Label>
                                                <Input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} />
                                            </div>
                                            <div className="space-y-1">
                                                <Label>Slug</Label>
                                                <Input value={editing.slug} onChange={e => setEditing({ ...editing, slug: e.target.value })} />
                                            </div>
                                            <div className="space-y-1">
                                                <Label>Sort</Label>
                                                <Input type="number" value={editing.sort_order || 0} onChange={e => setEditing({ ...editing, sort_order: Number(e.target.value) })} />
                                            </div>
                                        </div>

                                        {/* Image Upload in Edit Mode */}
                                        <div className="space-y-2">
                                            <Label>Category Image</Label>
                                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                                {editing.image_url ? (
                                                    <div className="relative">
                                                        <img src={editing.image_url} alt="Preview" className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-lg border" />
                                                        <Button
                                                            variant="destructive"
                                                            size="icon"
                                                            className="absolute -top-2 -right-2 h-6 w-6"
                                                            onClick={() => setEditing({ ...editing, image_url: null })}
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div className="w-24 h-24 sm:w-32 sm:h-32 border-2 border-dashed rounded-lg flex items-center justify-center bg-muted flex-shrink-0">
                                                        {uploadingImage === cat.id ? (
                                                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                                        ) : (
                                                            <Upload className="h-6 w-6 text-muted-foreground" />
                                                        )}
                                                    </div>
                                                )}
                                                <div className="flex-1 w-full sm:w-auto">
                                                    <Input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => handleImageChange(e, cat.id)}
                                                        disabled={uploadingImage === cat.id}
                                                        className="cursor-pointer"
                                                    />
                                                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-2">
                                            <Button onClick={handleUpdate} disabled={uploadingImage === cat.id} className="w-full sm:w-auto">
                                                <Save className="mr-2 h-4 w-4" />
                                                Save Changes
                                            </Button>
                                            <Button variant="ghost" onClick={() => setEditing(null)} className="w-full sm:w-auto">Cancel</Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                                            {cat.image_url ? (
                                                <img src={cat.image_url} alt={cat.name} className="w-12 h-12 md:w-16 md:h-16 object-cover rounded-lg border flex-shrink-0" />
                                            ) : (
                                                <div className="h-12 w-12 md:h-16 md:w-16 bg-secondary rounded flex items-center justify-center font-bold text-sm md:text-lg flex-shrink-0">
                                                    {cat.sort_order}
                                                </div>
                                            )}
                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-bold truncate">{cat.name}</h3>
                                                <p className="text-xs text-muted-foreground truncate">/{cat.slug}</p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => setEditing(cat)} className="flex-shrink-0">
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </>
    )
}

