"use client"

import { useState, useEffect } from "react"
import { MainNav } from "@/components/layout/main-nav"
import { Footer } from "@/components/layout/footer"
import { createClient } from "@/lib/supabase/client"
import { Database } from "@/lib/supabase/types"
import { Skeleton } from "@/components/ui/skeleton"

type Policy = Database['public']['Tables']['policies']['Row']

export default function PoliciesPage() {
    const [policy, setPolicy] = useState<Policy | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const supabase = createClient()
        
        async function fetchPolicy() {
            try {
                const { data, error } = await supabase
                    .from('policies')
                    .select('*')
                    .limit(1)
                    .single()
                
                if (error) throw error
                if (data) setPolicy(data)
            } catch (e) {
                console.error("Error fetching policies:", e)
                // Mock fallback
                setPolicy({
                    id: '1',
                    content: '# Business Policies\n\n**Payment Terms**\n- 70% deposit is required before work begins.\n- The remaining 30% is due during pickup or before delivery.'
                })
            } finally {
                setLoading(false)
            }
        }

        fetchPolicy()

        // Realtime subscription
        const channel = supabase
            .channel('policies-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'policies' }, () => {
                fetchPolicy()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    // Simple markdown-like rendering (basic)
    const renderContent = (content: string) => {
        const lines = content.split('\n')
        const elements: JSX.Element[] = []
        let currentParagraph: string[] = []
        let listItems: JSX.Element[] = []
        let inList = false

        const closeList = () => {
            if (inList && listItems.length > 0) {
                elements.push(
                    <ul key={`ul-${elements.length}`} className="list-disc list-inside space-y-2 mb-4 ml-4">
                        {listItems}
                    </ul>
                )
                listItems = []
                inList = false
            }
        }

        const closeParagraph = () => {
            if (currentParagraph.length > 0) {
                elements.push(<p key={`p-${elements.length}`} className="mb-4">{currentParagraph.join(' ')}</p>)
                currentParagraph = []
            }
        }

        lines.forEach((line, index) => {
            const trimmed = line.trim()
            
            if (trimmed.startsWith('# ')) {
                closeParagraph()
                closeList()
                elements.push(<h1 key={`h1-${index}`} className="text-3xl font-bold mb-6">{trimmed.substring(2)}</h1>)
            } else if (trimmed.startsWith('## ')) {
                closeParagraph()
                closeList()
                elements.push(<h2 key={`h2-${index}`} className="text-2xl font-semibold mt-8 mb-4">{trimmed.substring(3)}</h2>)
            } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                closeParagraph()
                if (!inList) {
                    inList = true
                }
                const text = trimmed.substring(2)
                // Handle bold text
                const parts = text.split(/(\*\*.*?\*\*)/g)
                listItems.push(
                    <li key={`li-${listItems.length}`} className="text-muted-foreground">
                        {parts.map((part, i) => 
                            part.startsWith('**') && part.endsWith('**') 
                                ? <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>
                                : part
                        )}
                    </li>
                )
            } else if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
                closeParagraph()
                closeList()
                elements.push(<p key={`p-bold-${index}`} className="font-semibold text-lg mb-4">{trimmed.slice(2, -2)}</p>)
            } else if (trimmed === '') {
                closeParagraph()
                closeList()
            } else {
                currentParagraph.push(trimmed)
            }
        })

        closeParagraph()
        closeList()

        return elements
    }

    return (
        <>
            <MainNav />
            <main className="flex-1 py-12 md:py-20">
                <div className="container max-w-4xl">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Policies</h1>
                        <p className="text-lg text-muted-foreground">
                            Please review our policies regarding payments, refunds, and media rights.
                        </p>
                    </div>

                    {loading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-8 w-full" />
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-24 w-full" />
                        </div>
                    ) : policy ? (
                        <div className="prose prose-lg max-w-none bg-card border rounded-xl p-8 shadow-sm">
                            {renderContent(policy.content)}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                            <p>Policy information is not available at the moment.</p>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </>
    )
}

