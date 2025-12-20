import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { AdminNav } from "@/components/admin/admin-nav"

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = createClient()
    const cookieStore = cookies()
    const isMockAdmin = cookieStore.get('mock_admin_session')?.value === 'true'

    if (isMockAdmin) {
        // Bypass auth checks for mock admin
        return (
            <div className="flex min-h-screen flex-col md:flex-row bg-muted/20">
                <AdminNav />
                <div className="flex-1 md:ml-64 pt-14 md:pt-0">
                    {children}
                </div>
            </div>
        )
    }

    // Check auth
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/admin/login')
    }

    // Check if admin email is in 'admins' table
    const { data: adminRecord } = await supabase
        .from('admins')
        .select('email')
        .eq('email', user.email)
        .single()

    if (!adminRecord) {
        // User is logged in but not an admin
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center p-8 bg-destructive/10 rounded-xl text-destructive">
                    <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
                    <p>Your account ({user.email}) is not authorized for this area.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen flex-col md:flex-row bg-muted/20">
            <AdminNav />
            <div className="flex-1 md:ml-64 pt-14 md:pt-0">
                {children}
            </div>
        </div>
    )
}
