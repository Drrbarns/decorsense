"use client"

import { MainNav } from "@/components/layout/main-nav"
import { Footer } from "@/components/layout/footer"
import { Heart, Gift, Smile } from "lucide-react"

export default function AboutPage() {
    return (
        <>
            <MainNav />
            <main className="flex-1">
                {/* Header */}
                <section className="bg-primary/5 py-16 md:py-24">
                    <div className="container text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">About DecorSense</h1>
                        <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
                            We are more than just a gift shop. We are creators of cherished memories, dedicated to bringing your deepest sentiments to life through art and surprises.
                        </p>
                    </div>
                </section>

                {/* Story */}
                <section className="py-20">
                    <div className="container grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden bg-muted">
                            {/* Placeholder for About Image */}
                            <img
                                src="/about-story.png"
                                alt="DecorSense Team"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold">Our Story</h2>
                            <div className="prose prose-lg text-muted-foreground">
                                <p>
                                    Founded in Adenta, Ghana, DecorSense started with a simple passion: making people smile. We realized that while many people want to express love and appreciation, finding the perfect, reliable gesture can be stressful.
                                </p>
                                <p>
                                    Today, we have grown into a full-service gifting brand, specializing in elaborate money bouquets, luxury hampers, and surprise delivery setups that have touched hundreds of hearts across Accra and Tema.
                                </p>
                                <p>
                                    Our mission is to simplify gifting while maintaining the highest standard of elegance and personalization.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Values */}
                <section className="py-20 bg-muted/30">
                    <div className="container">
                        <h2 className="text-center text-3xl font-bold mb-12">Why Choose Us</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="bg-background p-8 rounded-xl shadow-sm text-center">
                                <Heart className="h-10 w-10 text-primary mx-auto mb-4" />
                                <h3 className="text-xl font-bold mb-2">Passion for Detail</h3>
                                <p className="text-muted-foreground">Every ribbon, every flower, and every note is placed with intention and care.</p>
                            </div>
                            <div className="bg-background p-8 rounded-xl shadow-sm text-center">
                                <Smile className="h-10 w-10 text-primary mx-auto mb-4" />
                                <h3 className="text-xl font-bold mb-2">Customer Happiness</h3>
                                <p className="text-muted-foreground">Your satisfaction is our priority. We communicate clearly and deliver on time.</p>
                            </div>
                            <div className="bg-background p-8 rounded-xl shadow-sm text-center">
                                <Gift className="h-10 w-10 text-primary mx-auto mb-4" />
                                <h3 className="text-xl font-bold mb-2">Premium Quality</h3>
                                <p className="text-muted-foreground">We use only the freshest flowers and high-quality materials for our packages.</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    )
}
