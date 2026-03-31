"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Menu, X, ShoppingBag, Phone } from "lucide-react"
import { useData } from "@/components/providers/data-provider"

export function MainNav() {
    const pathname = usePathname()
    const { settings } = useData()
    const [mobileOpen, setMobileOpen] = React.useState(false)

    const routes = [
        { href: "/", label: "Home" },
        { href: "/shop", label: "Shop" },
        { href: "/gallery", label: "Gallery" },
        { href: "/about", label: "About" },
        { href: "/contact", label: "Contact" },
    ]

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
            <div className="container flex h-16 items-center justify-between">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-primary">
                    <ShoppingBag className="h-6 w-6" />
                    <span>{settings?.business_name || "DecorSense"}</span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                    {routes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "transition-colors hover:text-primary",
                                pathname === route.href ? "text-foreground" : "text-muted-foreground"
                            )}
                        >
                            {route.label}
                        </Link>
                    ))}
                    <Button asChild size="sm" className="ml-4">
                        <a href={settings?.whatsapp_link || "#"} target="_blank" rel="noopener noreferrer">
                            WhatsApp Us
                        </a>
                    </Button>
                </nav>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden p-2 text-muted-foreground"
                    onClick={() => setMobileOpen(!mobileOpen)}
                >
                    {mobileOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Nav */}
            {mobileOpen && (
                <div className="md:hidden border-t bg-background p-4 animate-fade-in">
                    <nav className="flex flex-col gap-4">
                        {routes.map((route) => (
                            <Link
                                key={route.href}
                                href={route.href}
                                onClick={() => setMobileOpen(false)}
                                className={cn(
                                    "text-lg font-medium transition-colors hover:text-primary",
                                    pathname === route.href ? "text-primary" : "text-muted-foreground"
                                )}
                            >
                                {route.label}
                            </Link>
                        ))}
                        <Button asChild className="w-full mt-2">
                            <a href={settings?.whatsapp_link || "#"} target="_blank" rel="noopener noreferrer">
                                WhatsApp Us
                            </a>
                        </Button>
                    </nav>
                </div>
            )}
        </header>
    )
}
