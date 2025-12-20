"use client"

import { useEffect, useState } from "react"
import { AdminNav } from "@/components/admin/admin-nav"
import { createClient } from "@/lib/supabase/client"
import { Database } from "@/lib/supabase/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

type Settings = Database['public']['Tables']['site_settings']['Row']

export default function AdminSettings() {
    const [settings, setSettings] = useState<Partial<Settings>>({})
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        supabase.from('site_settings').select('*').single().then((res: any) => {
            if (res.data) setSettings(res.data)
            setLoading(false)
        })
    }, [])

    const handleSave = async () => {
        setSaving(true)
        // If no row exists, we might need to insert, but seed creates one.
        // Assuming ID exists.
        if (settings.id) {
            const { error } = await (supabase.from('site_settings') as any).update({
                business_name: settings.business_name,
                phone: settings.phone,
                whatsapp_link: settings.whatsapp_link,
                address: settings.address
            }).eq('id', settings.id)

            if (error) toast.error(error.message)
            else toast.success("Settings updated")
        }
        setSaving(false)
    }

    if (loading) return <div className="flex-1 p-4 md:p-6 lg:p-8">Loading...</div>

    return (
        <div className="flex-1 p-4 md:p-6 lg:p-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">Site Settings</h1>

            <div className="max-w-2xl space-y-4 md:space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>General Information</CardTitle>
                            <CardDescription>Visible on header, footer, and contact page.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Business Name</Label>
                                <Input value={settings.business_name || ""} onChange={e => setSettings({ ...settings, business_name: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Phone Number</Label>
                                <Input value={settings.phone || ""} onChange={e => setSettings({ ...settings, phone: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>WhatsApp Link (Full URL)</Label>
                                <Input value={settings.whatsapp_link || ""} onChange={e => setSettings({ ...settings, whatsapp_link: e.target.value })} />
                                <p className="text-xs text-muted-foreground">e.g. https://wa.me/233245131057</p>
                            </div>
                            <div className="space-y-2">
                                <Label>Address</Label>
                                <Input value={settings.address || ""} onChange={e => setSettings({ ...settings, address: e.target.value })} />
                            </div>

                            <Button onClick={handleSave} disabled={saving} className="mt-4">
                                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </CardContent>
                    </Card>
                </div>
        </div>
    )
}
