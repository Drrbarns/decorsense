"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Gift, Sparkles } from "lucide-react"

export function Hero() {
    return (
        <section className="relative w-full min-h-[90vh] md:min-h-[95vh] flex items-center justify-center overflow-hidden bg-black">
            {/* Background Image */}
            <div className="absolute inset-0 w-full h-full z-10">
                <img
                    src="/hero.jpg"
                    alt="Hero Background"
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Solid Overlay */}
            <div className="absolute inset-0 bg-black/60 z-20 pointer-events-none" />
            
            {/* Floating Particles Effect */}
            <div className="absolute inset-0 z-20 pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-white/30 rounded-full animate-float"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 3}s`,
                            animationDuration: `${3 + Math.random() * 4}s`
                        }}
                    />
                ))}
            </div>

            {/* Content */}
            <div className="container relative z-30 flex flex-col items-center text-center px-4 py-20">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 backdrop-blur-xl px-6 py-3 text-sm text-white shadow-2xl mb-8 animate-fade-in hover:bg-white/10 hover:border-white/30 transition-all duration-300 group">
                    <Sparkles className="h-4 w-4 text-pink-400 animate-pulse" />
                    <span className="font-semibold tracking-wider uppercase text-xs sm:text-sm">Premium Gifting Service in Ghana</span>
                </div>

                {/* Main Heading */}
                <h1 className="max-w-6xl text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-white mb-6 leading-[1.1] drop-shadow-2xl">
                    <span className="block mb-2">Make Every Moment</span>
                    <span className="relative inline-block">
                        <span className="text-white">
                            Unforgettable
                        </span>
                        <div className="absolute -bottom-2 left-0 right-0 h-1 bg-primary rounded-full opacity-50" />
                    </span>
                </h1>

                {/* Subheading */}
                <p className="max-w-3xl text-lg sm:text-xl md:text-2xl text-zinc-100 mb-12 leading-relaxed font-light drop-shadow-lg">
                    <span className="block mb-2">Luxury money bouquets, premium flower boxes, and surprise deliveries.</span>
                    <span className="block font-medium text-white/90">We craft the memories, you get the credit.</span>
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto items-center justify-center">
                    <Button 
                        size="lg" 
                        className="h-16 rounded-full px-10 text-lg font-bold shadow-2xl hover:scale-105 transition-all duration-300 bg-primary hover:bg-primary/90 text-white border-0 group" 
                        asChild
                    >
                        <Link href="/shop" className="flex items-center gap-2">
                            <Gift className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                            Browse Packages
                        </Link>
                    </Button>
                    <Button 
                        variant="outline" 
                        size="lg" 
                        className="h-16 rounded-full px-10 text-lg font-semibold border-2 border-white/40 text-white hover:bg-white/20 hover:text-white bg-white/5 backdrop-blur-xl hover:border-white/60 transition-all duration-300 group" 
                        asChild
                    >
                        <a href="https://wa.me/233245131057" target="_blank" className="flex items-center gap-2">
                            Order via WhatsApp
                            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </a>
                    </Button>
                </div>
            </div>
        </section>
    )
}
