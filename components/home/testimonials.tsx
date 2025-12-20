"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Database } from "@/lib/supabase/types"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Star } from "lucide-react"

type Testimonial = Database['public']['Tables']['testimonials']['Row']

export function TestimonialsSection() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const supabase = createClient()
        
        async function fetchTestimonials() {
            try {
                const { data, error } = await supabase
                    .from('testimonials')
                    .select('*')
                    .eq('is_active', true)
                    .order('sort_order', { ascending: true })
                    .limit(3)
                
                if (error) throw error
                if (data) setTestimonials(data)
            } catch (e) {
                console.error("Error fetching testimonials:", e)
                // Mock fallback
                setTestimonials([
                    {
                        id: '1',
                        customer_name: 'Sarah M.',
                        content: 'Absolutely amazing service! The money bouquet was beautifully arranged and delivered on time.',
                        rating: 5,
                        is_featured: true,
                        is_active: true,
                        sort_order: 1,
                        created_at: '',
                        updated_at: '',
                        image_url: null
                    },
                ])
            } finally {
                setLoading(false)
            }
        }

        fetchTestimonials()

        // Realtime subscription
        const channel = supabase
            .channel('testimonials-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'testimonials' }, () => {
                fetchTestimonials()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-48 w-full" />
                ))}
            </div>
        )
    }

    if (testimonials.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                <p>No testimonials available at the moment.</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {testimonials.map((testimonial, index) => (
                <Card 
                    key={testimonial.id} 
                    className="group border-2 border-primary/10 hover:border-primary/40 transition-all duration-300 shadow-lg hover:shadow-2xl bg-card/50 backdrop-blur-sm overflow-hidden relative"
                    style={{ animationDelay: `${index * 0.1}s` }}
                >
                    {/* Decorative Gradient */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    <CardContent className="p-6 md:p-8 relative z-10">
                        {/* Quote Icon */}
                        <div className="absolute top-4 right-4 text-primary/10 group-hover:text-primary/20 transition-colors">
                            <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.996 2.151c-2.432.917-3.996 3.638-3.996 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                            </svg>
                        </div>
                        
                        <div className="flex items-center gap-1 mb-6">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={`h-5 w-5 transition-all duration-300 ${
                                        i < (testimonial.rating || 5)
                                            ? 'fill-yellow-400 text-yellow-400 group-hover:scale-110'
                                            : 'text-muted-foreground/30'
                                    }`}
                                    style={{ transitionDelay: `${i * 0.05}s` }}
                                />
                            ))}
                        </div>
                        <p className="text-foreground/80 mb-6 leading-relaxed text-base md:text-lg italic relative z-10">
                            "{testimonial.content}"
                        </p>
                        <div className="flex items-center gap-3 pt-4 border-t border-primary/10">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center font-bold text-primary">
                                {testimonial.customer_name?.charAt(0) || '?'}
                            </div>
                            <p className="font-semibold text-sm md:text-base text-foreground">— {testimonial.customer_name}</p>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

