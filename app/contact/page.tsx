"use client"

import { MainNav } from "@/components/layout/main-nav"
import { Footer } from "@/components/layout/footer"
import { useData } from "@/components/providers/data-provider"
import { Button } from "@/components/ui/button"
import { MapPin, Phone, MessageCircle, Clock, Mail } from "lucide-react"

export default function ContactPage() {
    const { settings } = useData()

    return (
        <>
            <MainNav />
            <main className="flex-1 py-12 md:py-20">
                <div className="container">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        <div>
                            <h1 className="text-4xl font-bold mb-6">Get in Touch</h1>
                            <p className="text-lg text-muted-foreground mb-8">
                                Have a question or want to plan a custom surprise? We'd love to hear from you.
                            </p>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-primary/10 rounded-full text-primary">
                                        <MapPin size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">Visit Us</h3>
                                        <p className="text-muted-foreground">{settings?.address || "Adenta Newsite, Ghana"}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-primary/10 rounded-full text-primary">
                                        <Phone size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">Call Us</h3>
                                        <p className="text-muted-foreground">{settings?.phone || "024 513 1057"}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-primary/10 rounded-full text-primary">
                                        <MessageCircle size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">WhatsApp</h3>
                                        <p className="text-muted-foreground mb-2">Fastest response time.</p>
                                        <Button asChild size="sm">
                                            <a href={settings?.whatsapp_link || "#"} target="_blank">Chat Now</a>
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-primary/10 rounded-full text-primary">
                                        <Clock size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">Working Hours</h3>
                                        <p className="text-muted-foreground">Mon - Sat: 9:00 AM - 6:00 PM</p>
                                        <p className="text-muted-foreground">Sun: Closed (Deliveries only)</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl overflow-hidden min-h-[400px] border relative bg-muted">
                            {/* Google Map Embed Placeholder */}
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15881.026727221087!2d-0.1292839!3d5.6796323!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xfdf83748259463b%3A0x8ba6714070a7df84!2sAdenta%2C%20Ghana!5e0!3m2!1sen!2sus!4v1716383000000!5m2!1sen!2sus"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Map"
                            />
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    )
}
