"use client"

import Link from "next/link"
import { useData } from "@/components/providers/data-provider"
import { Facebook, Instagram, Twitter, MapPin, Phone, Mail } from "lucide-react"

export function Footer() {
    const { settings } = useData()

    return (
        <footer className="bg-muted/30 border-t pt-16 pb-8">
            <div className="container">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-primary">{settings?.business_name || "DecorSense"}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Premium gifting and surprise delivery service. We make every moment magical with our curated packages and decor services.
                        </p>
                        <div className="flex gap-4">
                            {/* Social placeholders if not in settings */}
                            <Link href="#" className="p-2 bg-background rounded-full hover:text-primary transition-colors">
                                <Instagram size={18} />
                            </Link>
                            <Link href="#" className="p-2 bg-background rounded-full hover:text-primary transition-colors">
                                <Facebook size={18} />
                            </Link>
                            <Link href="#" className="p-2 bg-background rounded-full hover:text-primary transition-colors">
                                <Twitter size={18} />
                            </Link>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4">Shop</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/shop" className="hover:text-primary">All Packages</Link></li>
                            <li><Link href="/shop?category=money-packages" className="hover:text-primary">Money Bouquets</Link></li>
                            <li><Link href="/shop?category=fresh-flowers" className="hover:text-primary">Fresh Flowers</Link></li>
                            <li><Link href="/shop?category=surprise-packages" className="hover:text-primary">Surprises</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4">Support</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/policies" className="hover:text-primary">Our Policies</Link></li>
                            <li><Link href="/faq" className="hover:text-primary">FAQs</Link></li>
                            <li><Link href="/contact" className="hover:text-primary">Contact Us</Link></li>
                            <li><Link href="/admin" className="hover:text-primary">Admin Login</Link></li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-semibold mb-4">Contact</h4>
                        <div className="flex items-start gap-3 text-sm text-muted-foreground">
                            <MapPin size={16} className="mt-1 shrink-0" />
                            <span>{settings?.address || "Adenta Newsite, Ghana"}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <Phone size={16} className="shrink-0" />
                            <span>{settings?.phone || "024 513 1057"}</span>
                        </div>
                        {settings?.whatsapp_link && (
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <Mail size={16} className="shrink-0" />
                                <a href={settings.whatsapp_link} target="_blank" className="hover:underline">Chat on WhatsApp</a>
                            </div>
                        )}
                    </div>
                </div>

                <div className="border-t pt-8 text-center text-sm text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} {settings?.business_name}. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}
