"use client"

import { useState, useEffect } from "react"
import { MainNav } from "@/components/layout/main-nav"
import { Footer } from "@/components/layout/footer"
import { createClient } from "@/lib/supabase/client"
import { Database } from "@/lib/supabase/types"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Skeleton } from "@/components/ui/skeleton"

type FAQ = Database['public']['Tables']['faqs']['Row']

export default function FAQPage() {
    const [faqs, setFaqs] = useState<FAQ[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const supabase = createClient()
        
        async function fetchFAQs() {
            try {
                const { data, error } = await supabase
                    .from('faqs')
                    .select('*')
                    .eq('is_active', true)
                    .order('sort_order', { ascending: true })
                
                if (error) throw error
                if (data) setFaqs(data)
            } catch (e) {
                console.error("Error fetching FAQs:", e)
                // Mock fallback
                setFaqs([
                    { id: '1', question: 'How much notice do you need?', answer: 'Ideally 2-3 days for standard orders. Large events require 1-2 weeks notice.', sort_order: 1, is_active: true },
                    { id: '2', question: 'Do you deliver?', answer: 'Yes, we deliver to Adenta, Accra, and Tema areas. Delivery fees may apply depending on location.', sort_order: 2, is_active: true },
                ])
            } finally {
                setLoading(false)
            }
        }

        fetchFAQs()

        // Realtime subscription
        const channel = supabase
            .channel('faqs-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'faqs' }, () => {
                fetchFAQs()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    return (
        <>
            <MainNav />
            <main className="flex-1 py-12 md:py-20">
                <div className="container max-w-4xl">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h1>
                        <p className="text-lg text-muted-foreground">
                            Find answers to common questions about our services, policies, and ordering process.
                        </p>
                    </div>

                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3, 4].map(i => (
                                <Skeleton key={i} className="h-24 w-full" />
                            ))}
                        </div>
                    ) : (
                        <Accordion type="single" collapsible className="w-full space-y-4">
                            {faqs.map((faq) => (
                                <AccordionItem key={faq.id} value={faq.id} className="border rounded-lg px-6 bg-card">
                                    <AccordionTrigger className="text-left font-semibold text-lg hover:no-underline">
                                        {faq.question}
                                    </AccordionTrigger>
                                    <AccordionContent className="text-muted-foreground leading-relaxed pb-4">
                                        {faq.answer}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    )}

                    {!loading && faqs.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                            <p>No FAQs available at the moment. Please contact us directly for any questions.</p>
                        </div>
                    )}

                    <div className="mt-12 text-center p-6 bg-secondary/30 rounded-xl">
                        <p className="text-lg mb-4">Still have questions?</p>
                        <a 
                            href="https://wa.me/233245131057" 
                            target="_blank" 
                            className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                        >
                            Chat with us on WhatsApp
                        </a>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    )
}



