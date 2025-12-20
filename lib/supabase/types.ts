export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            categories: {
                Row: {
                    id: string
                    name: string
                    slug: string
                    description: string | null
                    image_url: string | null
                    sort_order: number
                    is_featured: boolean
                    is_active: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    slug: string
                    description?: string | null
                    image_url?: string | null
                    sort_order?: number
                    is_featured?: boolean
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    slug?: string
                    description?: string | null
                    image_url?: string | null
                    sort_order?: number
                    is_featured?: boolean
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            products: {
                Row: {
                    id: string
                    category_id: string | null
                    name: string
                    slug: string
                    short_desc: string | null
                    long_desc: string | null
                    pricing_type: 'FIXED' | 'RANGE' | 'AMOUNT_SERVICE_CHARGE' | 'REQUEST_QUOTE'
                    price: number | null
                    price_min: number | null
                    price_max: number | null
                    currency: string
                    is_featured: boolean
                    is_trending: boolean
                    is_active: boolean
                    tags: string[]
                    created_at: string
                    updated_at: string
                }
            }
            product_tiers: {
                Row: {
                    id: string
                    product_id: string
                    name: string
                    price: number
                    inclusions: string[]
                    is_default: boolean
                    sort_order: number
                }
            }
            product_price_rows: {
                Row: {
                    id: string
                    product_id: string
                    amount_min: number | null
                    amount_max: number | null
                    service_charge: number
                    notes: string | null
                }
            }
            product_images: {
                Row: {
                    id: string
                    product_id: string
                    url: string
                    sort_order: number
                    created_at: string
                }
            }
            addons: {
                Row: {
                    id: string
                    name: string
                    description: string | null
                    price: number
                    is_active: boolean
                }
            }
            gallery_items: {
                Row: {
                    id: string
                    title: string | null
                    media_type: 'image' | 'video'
                    url: string
                    caption: string | null
                    sort_order: number
                    is_active: boolean
                }
            }
            site_settings: {
                Row: {
                    id: string
                    business_name: string | null
                    phone: string | null
                    whatsapp_link: string | null
                    address: string | null
                    socials: Json | null
                    seo_defaults: Json | null
                    service_areas: string[] | null
                    home_sections: Json | null
                }
            }
            policies: {
                Row: {
                    id: string
                    content: string
                }
            }
            testimonials: {
                Row: {
                    id: string
                    customer_name: string
                    content: string
                    rating: number | null
                    image_url: string | null
                    is_featured: boolean
                    is_active: boolean
                    sort_order: number
                    created_at: string
                    updated_at: string
                }
            }
            order_requests: {
                Row: {
                    id: string
                    order_no: string | null
                    customer_name: string | null
                    phone: string | null
                    whatsapp: string | null
                    email: string | null
                    delivery_location: string | null
                    event_date: string | null
                    notes: string | null
                    items: Json | null
                    total_estimate: number | null
                    status: 'NEW' | 'CONTACTED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
                    source: 'FORM' | 'WHATSAPP' | 'PAYMENT'
                    internal_notes: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    order_no?: string | null
                    customer_name?: string | null
                    phone?: string | null
                    whatsapp?: string | null
                    email?: string | null
                    delivery_location?: string | null
                    event_date?: string | null
                    notes?: string | null
                    items?: Json | null
                    total_estimate?: number | null
                    status?: 'NEW' | 'CONTACTED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
                    source?: 'FORM' | 'WHATSAPP' | 'PAYMENT'
                    internal_notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            faqs: {
                Row: {
                    id: string
                    question: string
                    answer: string
                    sort_order: number
                    is_active: boolean
                }
            }
        }
    }
}
