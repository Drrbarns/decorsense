"use client"

import { useEffect, useState, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { Database } from "@/lib/supabase/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MOCK_ORDERS } from "@/lib/mock-data"
import { formatCurrency } from "@/lib/utils"
import { Eye, Search, Filter, CheckCircle2, XCircle, Clock, AlertCircle, Phone, Mail, MapPin, Calendar, ShoppingCart } from "lucide-react"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

type Order = Database['public']['Tables']['order_requests']['Row']

const ORDER_STATUSES = ['NEW', 'CONTACTED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as const

export default function AdminOrders() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
    const supabase = createClient()

    const fetchOrders = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase.from('order_requests').select('*').order('created_at', { ascending: false })
            if (error || !data) throw new Error("API Error")
            setOrders(data)
        } catch (e) {
            setOrders(MOCK_ORDERS as Order[])
        }
        setLoading(false)
    }

    useEffect(() => { fetchOrders() }, [])

    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            const matchesSearch = !search || 
                order.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
                order.order_no?.toLowerCase().includes(search.toLowerCase()) ||
                order.phone?.includes(search)
            const matchesStatus = statusFilter === 'all' || order.status === statusFilter
            return matchesSearch && matchesStatus
        })
    }, [orders, search, statusFilter])

    const updateOrderStatus = async (orderId: string, newStatus: string) => {
        const { error } = await supabase
            .from('order_requests')
            .update({ status: newStatus as any, updated_at: new Date().toISOString() })
            .eq('id', orderId)

        if (error) {
            toast.error(`Failed to update status: ${error.message}`)
        } else {
            toast.success("Order status updated")
            fetchOrders()
            if (selectedOrder?.id === orderId) {
                setSelectedOrder({ ...selectedOrder, status: newStatus as any })
            }
        }
    }

    const getStatusBadge = (status: string) => {
        const configs: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", icon: any, color: string }> = {
            'NEW': { variant: 'default', icon: AlertCircle, color: 'bg-blue-100 text-blue-800 border-blue-200' },
            'CONTACTED': { variant: 'secondary', icon: Phone, color: 'bg-purple-100 text-purple-800 border-purple-200' },
            'CONFIRMED': { variant: 'default', icon: CheckCircle2, color: 'bg-green-100 text-green-800 border-green-200' },
            'IN_PROGRESS': { variant: 'default', icon: Clock, color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
            'COMPLETED': { variant: 'default', icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
            'CANCELLED': { variant: 'destructive', icon: XCircle, color: 'bg-red-100 text-red-800 border-red-200' }
        }
        const config = configs[status] || { variant: 'secondary' as const, icon: null, color: '' }
        const Icon = config.icon
        return (
            <Badge variant={config.variant} className={`flex items-center gap-1 ${config.color}`}>
                {Icon && <Icon className="h-3 w-3" />}
                {status.replace('_', ' ')}
            </Badge>
        )
    }

    const statusCounts = useMemo(() => {
        const counts: Record<string, number> = {}
        ORDER_STATUSES.forEach(status => {
            counts[status] = orders.filter(o => o.status === status).length
        })
        return counts
    }, [orders])

    return (
        <div className="flex-1 p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Orders Management</h1>
                    <p className="text-sm md:text-base text-muted-foreground mt-1">View and manage customer order requests</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
                {ORDER_STATUSES.map(status => (
                    <Card key={status} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter(statusFilter === status ? 'all' : status)}>
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold">{statusCounts[status] || 0}</div>
                            <div className="text-xs text-muted-foreground mt-1">{status.replace('_', ' ')}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-3 md:p-4">
                    <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search orders..."
                                className="pl-9 text-sm"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <Filter className="mr-2 h-4 w-4" />
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                {ORDER_STATUSES.map(status => (
                                    <SelectItem key={status} value={status}>{status.replace('_', ' ')}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Orders Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Order Requests ({filteredOrders.length})</CardTitle>
                    <CardDescription>Manage customer orders and update their status</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <Skeleton key={i} className="h-20 w-full" />
                            ))}
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p className="font-medium">No orders found</p>
                            <p className="text-sm">Try adjusting your filters</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm min-w-[800px]">
                                <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
                                    <tr>
                                        <th className="px-3 md:px-4 py-2 md:py-3 text-left">Order #</th>
                                        <th className="px-3 md:px-4 py-2 md:py-3 text-left">Customer</th>
                                        <th className="px-3 md:px-4 py-2 md:py-3 text-left hidden md:table-cell">Contact</th>
                                        <th className="px-3 md:px-4 py-2 md:py-3 text-left">Total</th>
                                        <th className="px-3 md:px-4 py-2 md:py-3 text-left">Status</th>
                                        <th className="px-3 md:px-4 py-2 md:py-3 text-left hidden lg:table-cell">Date</th>
                                        <th className="px-3 md:px-4 py-2 md:py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredOrders.map((order) => (
                                        <tr key={order.id} className="border-b hover:bg-muted/30 transition-colors">
                                            <td className="px-3 md:px-4 py-3 md:py-4 font-medium">#{order.order_no || order.id.slice(0, 8)}</td>
                                            <td className="px-3 md:px-4 py-3 md:py-4">
                                                <div className="font-medium">{order.customer_name || 'Anonymous'}</div>
                                                {order.delivery_location && (
                                                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                                        <MapPin className="h-3 w-3" />
                                                        <span className="truncate max-w-[150px]">{order.delivery_location}</span>
                                                    </div>
                                                )}
                                                {/* Mobile: Show contact info inline */}
                                                <div className="md:hidden text-xs text-muted-foreground mt-1 space-y-1">
                                                    {order.phone && (
                                                        <div className="flex items-center gap-1">
                                                            <Phone className="h-3 w-3" />
                                                            {order.phone}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-3 md:px-4 py-3 md:py-4 hidden md:table-cell">
                                                <div className="text-xs space-y-1">
                                                    {order.phone && (
                                                        <div className="flex items-center gap-1">
                                                            <Phone className="h-3 w-3" />
                                                            {order.phone}
                                                        </div>
                                                    )}
                                                    {order.email && (
                                                        <div className="flex items-center gap-1">
                                                            <Mail className="h-3 w-3" />
                                                            {order.email}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-3 md:px-4 py-3 md:py-4 font-semibold">
                                                {order.total_estimate ? formatCurrency(order.total_estimate) : 'N/A'}
                                            </td>
                                            <td className="px-3 md:px-4 py-3 md:py-4">
                                                <Select 
                                                    value={order.status} 
                                                    onValueChange={(value) => updateOrderStatus(order.id, value)}
                                                >
                                                    <SelectTrigger className="w-[120px] md:w-[140px] h-8 text-xs">
                                                        {getStatusBadge(order.status)}
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {ORDER_STATUSES.map(status => (
                                                            <SelectItem key={status} value={status}>
                                                                {status.replace('_', ' ')}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </td>
                                            <td className="px-3 md:px-4 py-3 md:py-4 text-muted-foreground hidden lg:table-cell">
                                                <div className="text-xs">
                                                    <div>{new Date(order.created_at).toLocaleDateString()}</div>
                                                    <div className="flex items-center gap-1 mt-1">
                                                        <Clock className="h-3 w-3" />
                                                        {new Date(order.created_at).toLocaleTimeString()}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-3 md:px-4 py-3 md:py-4 text-right">
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm"
                                                    onClick={() => setSelectedOrder(order)}
                                                    className="text-xs"
                                                >
                                                    <Eye className="w-4 h-4 md:mr-1" />
                                                    <span className="hidden sm:inline">View</span>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Order Detail Dialog */}
            <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
                    {selectedOrder && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="text-lg sm:text-xl">Order Details #{selectedOrder.order_no || selectedOrder.id.slice(0, 8)}</DialogTitle>
                                <DialogDescription className="text-xs sm:text-sm">
                                    Created on {new Date(selectedOrder.created_at).toLocaleString()}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 md:space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Customer Name</label>
                                        <p className="mt-1">{selectedOrder.customer_name || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Status</label>
                                        <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Phone</label>
                                        <p className="mt-1">{selectedOrder.phone || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Email</label>
                                        <p className="mt-1">{selectedOrder.email || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Delivery Location</label>
                                        <p className="mt-1">{selectedOrder.delivery_location || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Event Date</label>
                                        <p className="mt-1">{selectedOrder.event_date ? new Date(selectedOrder.event_date).toLocaleDateString() : 'N/A'}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-sm font-medium text-muted-foreground">Total Estimate</label>
                                        <p className="mt-1 text-lg font-bold">{selectedOrder.total_estimate ? formatCurrency(selectedOrder.total_estimate) : 'N/A'}</p>
                                    </div>
                                </div>
                                {selectedOrder.notes && (
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Notes</label>
                                        <p className="mt-1 p-3 bg-muted rounded-md">{selectedOrder.notes}</p>
                                    </div>
                                )}
                                {selectedOrder.items && (
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Order Items</label>
                                        <pre className="mt-1 p-3 bg-muted rounded-md text-xs overflow-auto">
                                            {JSON.stringify(selectedOrder.items, null, 2)}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
