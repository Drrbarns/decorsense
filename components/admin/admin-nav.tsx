"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Tag, Package, Image, Settings, LogOut, FileText, Menu, X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export function AdminNav() {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    const routes = [
        { href: "/admin", label: "Overview", icon: LayoutDashboard },
        { href: "/admin/orders", label: "Orders", icon: FileText },
        { href: "/admin/categories", label: "Categories", icon: Tag },
        { href: "/admin/products", label: "Products", icon: Package },
        { href: "/admin/gallery", label: "Gallery", icon: Image },
        { href: "/admin/settings", label: "Settings", icon: Settings },
    ]

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/admin/login')
    }

    // Close mobile menu when route changes
    useEffect(() => {
        setMobileMenuOpen(false)
    }, [pathname])

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [mobileMenuOpen])

    return (
        <>
            {/* Mobile Header */}
            <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b h-14 flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                    <h2 className="text-lg font-bold text-primary">DS Admin</h2>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label="Toggle menu"
                >
                    {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
            </header>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar - Desktop & Mobile */}
            <aside
                className={cn(
                    "w-64 bg-card border-r flex flex-col h-screen fixed left-0 top-0 overflow-y-auto z-50 transition-transform duration-300 ease-in-out",
                    "md:translate-x-0",
                    mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
                )}
            >
                {/* Desktop Header */}
                <div className="hidden md:block p-6 border-b">
                    <h2 className="text-xl font-bold text-primary">DS Admin</h2>
                    <p className="text-xs text-muted-foreground">DecorSense Gifts</p>
                </div>

                {/* Mobile Header in Sidebar */}
                <div className="md:hidden p-6 border-b flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-primary">DS Admin</h2>
                        <p className="text-xs text-muted-foreground">DecorSense Gifts</p>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setMobileMenuOpen(false)}
                        aria-label="Close menu"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {routes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                                pathname === route.href || (route.href !== '/admin' && pathname.startsWith(route.href))
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <route.icon size={18} />
                            {route.label}
                        </Link>
                    ))}
                </nav>
                <div className="p-4 border-t">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-md w-full transition-colors"
                    >
                        <LogOut size={18} />
                        Sign Out
                    </button>
                </div>
            </aside>
        </>
    )
}
