"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export default function AdminLoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [isSignUp, setIsSignUp] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        if (isSignUp) {
            // Sign up
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/admin`,
                },
            })

            if (error) {
                toast.error(error.message)
                setLoading(false)
            } else {
                toast.success("Account created! Please check your email to verify your account.")
                setLoading(false)
                // Optionally switch to sign in mode
                setIsSignUp(false)
            }
        } else {
            // Sign in
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) {
                toast.error(error.message)
                setLoading(false)
            } else {
                toast.success("Welcome back")
                router.push("/admin")
                router.refresh()
            }
        }
    }

    return (
        <div className="flex h-screen items-center justify-center bg-muted/30">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl">
                        {isSignUp ? "Admin Sign Up" : "Admin Login"}
                    </CardTitle>
                    <CardDescription>
                        {isSignUp
                            ? "Create an admin account. Your email must be in the admins table."
                            : "Enter your credentials to access the dashboard."}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="decorsense@gmail.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                required
                                minLength={6}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            {isSignUp && (
                                <p className="text-xs text-muted-foreground">
                                    Password must be at least 6 characters
                                </p>
                            )}
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isSignUp ? "Sign Up" : "Sign In"}
                        </Button>
                    </form>
                    <div className="mt-4 text-center">
                        <button
                            type="button"
                            onClick={() => {
                                setIsSignUp(!isSignUp)
                                setEmail("")
                                setPassword("")
                            }}
                            className="text-sm text-muted-foreground hover:text-primary underline"
                        >
                            {isSignUp
                                ? "Already have an account? Sign in"
                                : "Don't have an account? Sign up"}
                        </button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
