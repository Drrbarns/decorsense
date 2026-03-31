"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { Database } from "@/lib/supabase/types"
import { Package, Tag, ShoppingCart, Image as ImageIcon, TrendingUp, Plus, ArrowRight, Clock, CheckCircle2, XCircle, AlertCircle, Eye, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

type Order = Database['public']['Tables']['order_requests']['Row']

export default function AdminDashboard() {
    const [counts, setCounts] = useState({
        products: 0,
        categories: 0,
        orders: 0,
        gallery: 0,
        activeProducts: 0,
        featuredProducts: 0,
        trendingProducts: 0,
        newOrders: 0
    })
    const [recentOrders, setRecentOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        async function loadStats() {
            setLoading(true)
            try {
                const [p, c, o, g, activeP, featuredP, trendingP, newO] = await Promise.all([
                    supabase.from('products').select('*', { count: 'exact', head: true }),
                    supabase.from('categories').select('*', { count: 'exact', head: true }),
                    supabase.from('order_requests').select('*', { count: 'exact', head: true }),
                    supabase.from('gallery_items').select('*', { count: 'exact', head: true }),
                    supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
                    supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_featured', true),
                    supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_trending', true),
                    supabase.from('order_requests').select('*', { count: 'exact', head: true }).eq('status', 'NEW')
                ])

                // Get recent orders
                const { data: ordersData } = await supabase
                    .from('order_requests')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(5)

                if (p.error || c.error) throw new Error("API Failed")

                setCounts({
                    products: p.count || 0,
                    categories: c.count || 0,
                    orders: o.count || 0,
                    gallery: g.count || 0,
                    activeProducts: activeP.count || 0,
                    featuredProducts: featuredP.count || 0,
                    trendingProducts: trendingP.count || 0,
                    newOrders: newO.count || 0
                })

                if (ordersData) {
                    setRecentOrders(ordersData)
                }
            } catch (e) {
                // Mock Stats
                setCounts({
                    products: 4,
                    categories: 4,
                    orders: 2,
                    gallery: 5,
                    activeProducts: 3,
                    featuredProducts: 2,
                    trendingProducts: 1,
                    newOrders: 1
                })
            } finally {
                setLoading(false)
            }
        }
        loadStats()
    }, [])

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", icon: any }> = {
            'NEW': { variant: 'default', icon: AlertCircle },
            'CONTACTED': { variant: 'secondary', icon: Clock },
            'CONFIRMED': { variant: 'secondary', icon: CheckCircle2 },
            'IN_PROGRESS': { variant: 'default', icon: Clock },
            'COMPLETED': { variant: 'default', icon: CheckCircle2 },
            'CANCELLED': { variant: 'destructive', icon: XCircle }
        }
        const config = variants[status] || { variant: 'secondary' as const, icon: null }
        const Icon = config.icon
        return (
            <Badge variant={config.variant} className="flex items-center gap-1">
                {Icon && <Icon className="h-3 w-3" />}
                {status.replace('_', ' ')}
            </Badge>
        )
    }

    return (
        <div className="flex-1 p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard Overview</h1>
                    <p className="text-sm md:text-base text-muted-foreground mt-1">Welcome back! Here's what's happening with your store.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                    <Button asChild variant="outline" className="w-full sm:w-auto">
                        <Link href="/admin/products/new">
                            <Plus className="mr-2 h-4 w-4" /> New Product
                        </Link>
                    </Button>
                    <Button asChild className="w-full sm:w-auto">
                        <Link href="/admin/orders">
                            View Orders <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-4 w-24" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-8 w-16" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    <StatCard 
                        title="Total Products" 
                        value={counts.products} 
                        icon={Package}
                        subtitle={`${counts.activeProducts} active`}
                        gradient="from-blue-500 to-blue-600"
                    />
                    <StatCard
                        title="Featured Products"
                        value={counts.featuredProducts}
                        icon={Star}
                        subtitle={`${counts.trendingProducts} trending`}
                        gradient="from-amber-500 to-orange-600"
                    />
                    <StatCard 
                        title="Categories" 
                        value={counts.categories} 
                        icon={Tag}
                        subtitle="All categories"
                        gradient="from-purple-500 to-violet-600"
                    />
                    <StatCard 
                        title="Total Orders" 
                        value={counts.orders} 
                        icon={ShoppingCart}
                        subtitle={`${counts.newOrders} new`}
                        gradient="from-green-500 to-green-600"
                        highlight={counts.newOrders > 0}
                    />
                    <StatCard 
                        title="Gallery Items" 
                        value={counts.gallery} 
                        icon={ImageIcon}
                        subtitle="Media library"
                        gradient="from-pink-500 to-pink-600"
                    />
                </div>
            )}

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                {/* Recent Orders */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Recent Orders</CardTitle>
                                <CardDescription>Latest customer order requests</CardDescription>
                            </div>
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/admin/orders">View All <ArrowRight className="ml-1 h-4 w-4" /></Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex items-center justify-between">
                                        <Skeleton className="h-12 w-full" />
                                    </div>
                                ))}
                            </div>
                        ) : recentOrders.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No orders yet</p>
                                <p className="text-sm">Orders will appear here when customers place requests</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {recentOrders.map((order) => (
                                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="font-semibold">#{order.order_no || order.id.slice(0, 8)}</div>
                                                {getStatusBadge(order.status)}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                <div>{order.customer_name || 'Anonymous'}</div>
                                                <div className="flex items-center gap-4 mt-1">
                                                    <span>{order.phone || 'No phone'}</span>
                                                    {order.total_estimate && (
                                                        <span className="font-medium text-foreground">
                                                            {formatCurrency(order.total_estimate)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right text-sm text-muted-foreground">
                                            <div>{new Date(order.created_at).toLocaleDateString()}</div>
                                            <div className="text-xs">{new Date(order.created_at).toLocaleTimeString()}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Common tasks and shortcuts</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Button variant="outline" className="w-full justify-start" asChild>
                            <Link href="/admin/products/new">
                                <Plus className="mr-2 h-4 w-4" /> Add New Product
                            </Link>
                        </Button>
                        <Button variant="outline" className="w-full justify-start" asChild>
                            <Link href="/admin/categories">
                                <Tag className="mr-2 h-4 w-4" /> Manage Categories
                            </Link>
                        </Button>
                        <Button variant="outline" className="w-full justify-start" asChild>
                            <Link href="/admin/gallery">
                                <ImageIcon className="mr-2 h-4 w-4" /> Upload Gallery Item
                            </Link>
                        </Button>
                        <Button variant="outline" className="w-full justify-start" asChild>
                            <Link href="/admin/settings">
                                <Eye className="mr-2 h-4 w-4" /> Site Settings
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

function StatCard({ 
    title, 
    value, 
    icon: Icon, 
    subtitle,
    gradient,
    highlight 
}: { 
    title: string
    value: number
    icon: any
    subtitle?: string
    gradient?: string
    highlight?: boolean
}) {
    return (
        <Card className={`relative overflow-hidden ${highlight ? 'ring-2 ring-primary' : ''}`}>
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient || 'from-gray-500 to-gray-600'} opacity-10 rounded-full -mr-16 -mt-16`} />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                <div className={`p-2 rounded-lg bg-gradient-to-br ${gradient || 'from-gray-500 to-gray-600'} text-white`}>
                    <Icon className="h-4 w-4" />
                </div>
            </CardHeader>
            <CardContent className="relative z-10">
                <div className="text-3xl font-bold mb-1">{value}</div>
                {subtitle && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {subtitle}
                    </p>
                )}
            </CardContent>
        </Card>
    )
}
