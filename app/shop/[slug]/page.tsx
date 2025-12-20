import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { ProductDetailClient } from "@/components/shop/product-detail-client"
import { Metadata } from "next"

// Force dynamic rendering for this page since we need freshness on params
export const dynamic = 'force-dynamic'

interface Props {
    params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const supabase = createClient()
    const { data: product } = await supabase
        .from('products')
        .select('name, short_desc')
        .eq('slug', params.slug)
        .single()

    if (!product) return { title: 'Product Not Found' }

    return {
        title: product.name,
        description: product.short_desc
    }
}

export default async function ProductPage({ params }: Props) {
    const supabase = createClient()

    let product = null
    let tiresData: any[] = []
    let addonsData: any[] = []
    let pricesData: any[] = []
    let imagesData: any[] = []
    let settingsData: any = { whatsapp_link: "", phone: "" }
    
    // Initialize tiers array
    tiresData = []

    try {
        // Fetch product principal data
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('slug', params.slug)
            .single()

        if (error || !data) throw new Error("Product fetch failed or empty")
        product = data

        // Parallel fetch for related data
        const [tiersRes, addonsRes, pricesRes, imagesRes, settingsRes] = await Promise.all([
            supabase.from('product_tiers').select('*').eq('product_id', product.id).order('sort_order'),
            supabase.from('addons').select('*').eq('is_active', true),
            supabase.from('product_price_rows').select('*').eq('product_id', product.id),
            supabase.from('product_images').select('*').eq('product_id', product.id).order('sort_order'),
            supabase.from('site_settings').select('whatsapp_link, phone').single()
        ])

        tiresData = tiersRes.data || []
        addonsData = addonsRes.data || []
        pricesData = pricesRes.data || []
        imagesData = imagesRes.data || []
        settingsData = settingsRes.data || { whatsapp_link: "", phone: "" }

    } catch (e) {
        // MOCK FALLBACK - Products matching the seed structure
        const MOCK_PRODUCTS: any[] = [
            // FRESH FLOWERS
            { id: 'b0000000-0000-0000-0002-000000000001', name: 'Mixed Flowers', slug: 'mixed-flowers', category_id: '2', price: 450, pricing_type: 'FIXED', short_desc: 'Beautiful mixed flower arrangements with various stems.', long_desc: '', is_active: true, is_featured: true, created_at: '', updated_at: '', price_min: 450, price_max: 4000, currency: 'GHS', tags: [] },
            { id: 'b0000000-0000-0000-0002-000000000002', name: 'Roses', slug: 'roses', category_id: '2', price: 300, pricing_type: 'FIXED', short_desc: 'Premium fresh roses arranged with filler flowers and greeneries.', long_desc: '', is_active: true, is_featured: true, created_at: '', updated_at: '', price_min: 300, price_max: 4850, currency: 'GHS', tags: [] },
            { id: 'b0000000-0000-0000-0002-000000000003', name: 'Rose Arrangements (Box/Vase/Baskets)', slug: 'rose-arrangements', category_id: '2', price: 1000, pricing_type: 'FIXED', short_desc: 'Roses arranged with filler flowers and greeneries in boxes, vases, or baskets.', long_desc: '', is_active: true, is_featured: false, created_at: '', updated_at: '', price_min: 1000, price_max: 2500, currency: 'GHS', tags: [] },
            { id: 'b0000000-0000-0000-0002-000000000004', name: 'Mixed Flower Arrangements', slug: 'mixed-flower-arrangements', category_id: '2', price: 750, pricing_type: 'FIXED', short_desc: 'Mixed flowers arranged with spray roses, chrysanthemums, gypso, ruscus, lisiathus, lilies etc.', long_desc: '', is_active: true, is_featured: false, created_at: '', updated_at: '', price_min: 750, price_max: 2000, currency: 'GHS', tags: [] },
            { id: 'b0000000-0000-0000-0002-000000000005', name: 'Bridal Arrangements', slug: 'bridal-arrangements', category_id: '2', price: 550, pricing_type: 'FIXED', short_desc: 'Elegant bridal flower arrangements for your special day.', long_desc: '', is_active: true, is_featured: false, created_at: '', updated_at: '', price_min: 550, price_max: 1000, currency: 'GHS', tags: [] },
            // FAUX & ARTIFICIAL
            { id: 'b0000000-0000-0000-0003-000000000001', name: 'Faux / Velvet Flowers', slug: 'faux-velvet-flowers', category_id: '3', price: 350, pricing_type: 'FIXED', short_desc: 'Looks and feel like natural flowers.', long_desc: '', is_active: true, is_featured: true, created_at: '', updated_at: '', price_min: 350, price_max: 2500, currency: 'GHS', tags: [] },
            { id: 'b0000000-0000-0000-0003-000000000002', name: 'Artificial Bouquets (Satin Rose)', slug: 'artificial-satin-bouquets', category_id: '3', price: 250, pricing_type: 'FIXED', short_desc: 'Satin rose flowers arranged beautifully.', long_desc: '', is_active: true, is_featured: false, created_at: '', updated_at: '', price_min: 250, price_max: 2200, currency: 'GHS', tags: [] },
            { id: 'b0000000-0000-0000-0003-000000000003', name: 'Mixed Artificial Flowers', slug: 'mixed-artificial-flowers', category_id: '3', price: 350, pricing_type: 'FIXED', short_desc: 'Beautiful mixed artificial flower arrangements.', long_desc: '', is_active: true, is_featured: false, created_at: '', updated_at: '', price_min: 350, price_max: 1200, currency: 'GHS', tags: [] },
            // GIFT BOXES
            { id: 'b0000000-0000-0000-0004-000000000001', name: 'Birthday Gift Box Packages For Her', slug: 'gift-box-her', category_id: '4', price: 450, pricing_type: 'FIXED', short_desc: 'Curated gift boxes designed especially for her special day.', long_desc: '', is_active: true, is_featured: true, created_at: '', updated_at: '', price_min: 450, price_max: 2000, currency: 'GHS', tags: [] },
            { id: 'b0000000-0000-0000-0005-000000000001', name: 'Birthday Gift Box Packages For Him', slug: 'gift-box-him', category_id: '5', price: 500, pricing_type: 'FIXED', short_desc: 'Sophisticated gift boxes designed especially for him.', long_desc: '', is_active: true, is_featured: false, created_at: '', updated_at: '', price_min: 500, price_max: 2500, currency: 'GHS', tags: [] },
            // BALLOON TREATS
            { id: 'b0000000-0000-0000-0006-000000000001', name: 'Hot Air Balloon Treat Bouquet Packages', slug: 'balloon-treat-bouquet', category_id: '6', price: 300, pricing_type: 'FIXED', short_desc: 'Trendy hot air balloon style treat boxes with personalized balloons and treats.', long_desc: '', is_active: true, is_featured: true, created_at: '', updated_at: '', price_min: 300, price_max: 750, currency: 'GHS', tags: [] },
            // ROOM DECORATION
            { id: 'b0000000-0000-0000-0007-000000000001', name: 'Room Decoration Packages', slug: 'room-decoration', category_id: '7', price: 1000, pricing_type: 'FIXED', short_desc: 'Transform any space with our premium room decoration packages.', long_desc: '', is_active: true, is_featured: true, created_at: '', updated_at: '', price_min: 1000, price_max: 5500, currency: 'GHS', tags: [] },
            // SURPRISE PACKAGES
            { id: 'b0000000-0000-0000-0008-000000000001', name: 'Surprise Packages', slug: 'surprise-packages', category_id: '8', price: 1000, pricing_type: 'FIXED', short_desc: 'The ultimate surprise delivery experience with saxophone, party poppers, and more.', long_desc: '', is_active: true, is_featured: true, created_at: '', updated_at: '', price_min: 1000, price_max: 3000, currency: 'GHS', tags: [] },
        ]

        product = MOCK_PRODUCTS.find(p => p.slug === params.slug)

        if (product) {
            // Mock images
            imagesData = [
                { id: 'img-0', created_at: '', product_id: product.id, url: '/hero-bg.png', sort_order: 0 }
            ]

            // Mock tiers based on product
            if (product.slug === 'mixed-flowers') {
                tiresData = [
                    { id: 't1', product_id: product.id, name: 'Mini Lux (15+ stems)', price: 450, inclusions: [], sort_order: 1, is_default: false },
                    { id: 't2', product_id: product.id, name: 'Medium Elegance (20+)', price: 800, inclusions: [], sort_order: 2, is_default: false },
                    { id: 't3', product_id: product.id, name: 'Large Beauty (35+)', price: 1600, inclusions: [], sort_order: 3, is_default: false },
                    { id: 't4', product_id: product.id, name: 'Premium Bloom (40+)', price: 2000, inclusions: [], sort_order: 4, is_default: false },
                ]
            } else if (product.slug === 'roses') {
                tiresData = [
                    { id: 't5', product_id: product.id, name: '5 Roses', price: 300, inclusions: [], sort_order: 1, is_default: false },
                    { id: 't6', product_id: product.id, name: '5 Roses (with gypso/filler flowers)', price: 350, inclusions: [], sort_order: 2, is_default: false },
                    { id: 't7', product_id: product.id, name: '10 Roses', price: 550, inclusions: [], sort_order: 3, is_default: false },
                    { id: 't8', product_id: product.id, name: '10 Roses (with gypso/filler flowers)', price: 600, inclusions: [], sort_order: 4, is_default: false },
                    { id: 't9', product_id: product.id, name: '15 Roses', price: 750, inclusions: [], sort_order: 5, is_default: false },
                    { id: 't10', product_id: product.id, name: '15 Roses (with gypso/filler flowers)', price: 800, inclusions: [], sort_order: 6, is_default: false },
                    { id: 't11', product_id: product.id, name: '20 Roses', price: 1000, inclusions: [], sort_order: 7, is_default: false },
                    { id: 't12', product_id: product.id, name: '20 Roses (with gypso/filler flowers)', price: 1200, inclusions: [], sort_order: 8, is_default: false },
                    { id: 't13', product_id: product.id, name: '30 Roses', price: 1500, inclusions: [], sort_order: 9, is_default: false },
                    { id: 't14', product_id: product.id, name: '50 Roses', price: 2500, inclusions: [], sort_order: 10, is_default: false },
                    { id: 't15', product_id: product.id, name: '100 Roses', price: 4500, inclusions: [], sort_order: 11, is_default: false },
                    { id: 't16', product_id: product.id, name: '100 Roses (with filler flowers)', price: 4850, inclusions: [], sort_order: 12, is_default: false },
                ]
            } else if (product.slug === 'rose-arrangements') {
                tiresData = [
                    { id: 't17', product_id: product.id, name: 'Small (15 stems)', price: 1000, inclusions: ['Arranged with filler flowers and greeneries'], sort_order: 1, is_default: false },
                    { id: 't18', product_id: product.id, name: 'Medium (25 stems)', price: 1800, inclusions: ['Arranged with filler flowers and greeneries'], sort_order: 2, is_default: false },
                    { id: 't19', product_id: product.id, name: 'Large (40 stems)', price: 2500, inclusions: ['Arranged with filler flowers and greeneries'], sort_order: 3, is_default: false },
                ]
            } else if (product.slug === 'mixed-flower-arrangements') {
                tiresData = [
                    { id: 't20', product_id: product.id, name: 'Small', price: 750, inclusions: ['Arranged with spray roses, chrysanthemums, gypso, ruscus, lisiathus, lilies etc'], sort_order: 1, is_default: false },
                    { id: 't21', product_id: product.id, name: 'Medium', price: 1500, inclusions: ['Arranged with spray roses, chrysanthemums, gypso, ruscus, lisiathus, lilies etc'], sort_order: 2, is_default: false },
                    { id: 't22', product_id: product.id, name: 'Large', price: 2000, inclusions: ['Arranged with spray roses, chrysanthemums, gypso, ruscus, lisiathus, lilies etc'], sort_order: 3, is_default: false },
                ]
            } else if (product.slug === 'bridal-arrangements') {
                tiresData = [
                    { id: 't23', product_id: product.id, name: 'Small Size', price: 550, inclusions: [], sort_order: 1, is_default: false },
                    { id: 't24', product_id: product.id, name: 'Medium', price: 750, inclusions: [], sort_order: 2, is_default: false },
                    { id: 't25', product_id: product.id, name: 'Large', price: 1000, inclusions: [], sort_order: 3, is_default: false },
                ]
            } else if (product.slug === 'faux-velvet-flowers') {
                tiresData = [
                    { id: 't26', product_id: product.id, name: 'Small Size (10 stems)', price: 350, inclusions: [], sort_order: 1, is_default: false },
                    { id: 't27', product_id: product.id, name: 'Medium Size (15 stems)', price: 450, inclusions: [], sort_order: 2, is_default: false },
                    { id: 't28', product_id: product.id, name: 'Big Size (30 stems with fillers)', price: 800, inclusions: [], sort_order: 3, is_default: false },
                    { id: 't29', product_id: product.id, name: 'Luxury (50 stems)', price: 1200, inclusions: [], sort_order: 4, is_default: false },
                    { id: 't30', product_id: product.id, name: 'Jumbo (100 stems)', price: 2500, inclusions: [], sort_order: 5, is_default: false },
                ]
            } else if (product.slug === 'artificial-satin-bouquets') {
                tiresData = [
                    { id: 't31', product_id: product.id, name: 'Small Size (8 stems)', price: 250, inclusions: [], sort_order: 1, is_default: false },
                    { id: 't32', product_id: product.id, name: 'Small Size (8 stems with fillers/glitters)', price: 300, inclusions: [], sort_order: 2, is_default: false },
                    { id: 't33', product_id: product.id, name: 'Medium Size (12 stems)', price: 300, inclusions: [], sort_order: 3, is_default: false },
                    { id: 't34', product_id: product.id, name: 'Medium Size (12 stems with fillers/glitters)', price: 350, inclusions: [], sort_order: 4, is_default: false },
                    { id: 't35', product_id: product.id, name: 'Large Size (18 stems)', price: 450, inclusions: [], sort_order: 5, is_default: false },
                    { id: 't36', product_id: product.id, name: 'Large Size (18 stems with fillers/glitters)', price: 500, inclusions: [], sort_order: 6, is_default: false },
                    { id: 't37', product_id: product.id, name: 'Extra Large (25 stems)', price: 650, inclusions: [], sort_order: 7, is_default: false },
                    { id: 't38', product_id: product.id, name: '50 Stems Satin Roses', price: 1200, inclusions: [], sort_order: 8, is_default: false },
                    { id: 't39', product_id: product.id, name: '100 Stems Satin Roses', price: 2200, inclusions: [], sort_order: 9, is_default: false },
                ]
            } else if (product.slug === 'mixed-artificial-flowers') {
                tiresData = [
                    { id: 't40', product_id: product.id, name: 'Small', price: 350, inclusions: [], sort_order: 1, is_default: false },
                    { id: 't41', product_id: product.id, name: 'Medium', price: 500, inclusions: [], sort_order: 2, is_default: false },
                    { id: 't42', product_id: product.id, name: 'Large', price: 700, inclusions: [], sort_order: 3, is_default: false },
                    { id: 't43', product_id: product.id, name: 'Extra Large', price: 1200, inclusions: [], sort_order: 4, is_default: false },
                ]
            } else if (product.slug === 'gift-box-her') {
                tiresData = [
                    { id: 't44', product_id: product.id, name: 'Standard', price: 450, inclusions: ['Assorted chocolates', 'Body Mist', 'Fancy necklace set', 'Champagne', 'Lady Hand fan', 'Gift box', 'Birthday card'], sort_order: 1, is_default: false },
                    { id: 't45', product_id: product.id, name: 'Classic', price: 750, inclusions: ['Customized vacuum flask', 'Passport holder', 'Purse', 'Ladies classic watch', 'Hand fan', 'Champagne', 'Perfume', 'Stylish sippy cup', 'Gift box with card'], sort_order: 2, is_default: false },
                    { id: 't46', product_id: product.id, name: 'Gold Package', price: 1200, inclusions: ['Lux double walled sippy cup with handle', 'Custom notepad', 'Chocolate box', 'Lux handbag', 'Body mist', 'Purse', 'Wine', 'Nail care tool kit', 'Lip care set', 'Passport holder', 'Perfume set', 'Gift box and card'], sort_order: 3, is_default: false },
                    { id: 't47', product_id: product.id, name: 'Premium', price: 2000, inclusions: ['5 senses gifts set'], sort_order: 4, is_default: false },
                ]
            } else if (product.slug === 'gift-box-him') {
                tiresData = [
                    { id: 't48', product_id: product.id, name: 'Standard', price: 500, inclusions: ['Polo t-shirts', 'Shaving gel', 'Wine', 'Body lotion', 'Assorted chocolates', 'Gifts box and card'], sort_order: 1, is_default: false },
                    { id: 't49', product_id: product.id, name: 'Classic', price: 850, inclusions: ['Polo shirt', 'Perfume', 'Manly body lotion', 'Wallet', 'Custom notepad', 'Foreign chocolates', 'Gifts box and custom card'], sort_order: 2, is_default: false },
                    { id: 't50', product_id: product.id, name: 'Gold Package', price: 1500, inclusions: ['High quality men slippers', 'Customize non-tarnish bracelets', 'Custom double walled flask', 'Custom notepad', 'Shoe polish set', 'Sunglasses', 'Polo t-shirt', 'Wine', 'After shaving', 'Vacuum flask', 'Box of 5 pairs of socks', 'Gift box and card'], sort_order: 3, is_default: false },
                    { id: 't51', product_id: product.id, name: 'Premium', price: 2500, inclusions: ['5 senses gifts set'], sort_order: 4, is_default: false },
                ]
            } else if (product.slug === 'balloon-treat-bouquet') {
                tiresData = [
                    { id: 't52', product_id: product.id, name: 'Essential Box', price: 300, inclusions: ['Generic balloon customization', 'Assorted florals', 'Mini Gifts card'], sort_order: 1, is_default: false },
                    { id: 't53', product_id: product.id, name: 'Classic Box', price: 450, inclusions: ['Personalized balloon with name', 'Assorted chocolate bars', 'Small biscuits mix', 'Gifts card with personalized notes'], sort_order: 2, is_default: false },
                    { id: 't54', product_id: product.id, name: 'Love in a Box', price: 600, inclusions: ['Customized Balloon with name or preferred inscriptions', 'Mixed high-end chocolates', 'Champagne or non alcoholic wine', 'Shortbread cookies', 'Candy bars'], sort_order: 3, is_default: false },
                    { id: 't55', product_id: product.id, name: 'Golden Treat Box', price: 750, inclusions: ['Large customized balloons', 'Premium Chocolates', 'Imported cookies with Pringles', 'Fruit mix drink', 'Decorated filler box', 'Personalized Hand written notes'], sort_order: 4, is_default: false },
                ]
            } else if (product.slug === 'room-decoration') {
                tiresData = [
                    { id: 't56', product_id: product.id, name: 'Standard Setup', price: 1000, inclusions: ['Balloon Ceiling decor', 'Gifts Arrangement', 'Floral Petals', 'Party Popper', 'Birthday Card'], sort_order: 1, is_default: false },
                    { id: 't57', product_id: product.id, name: 'Classic Setup', price: 1500, inclusions: ['Balloon ceiling decor', 'Hot air balloon treat box', '4-in-One Cupcakes', 'Petals and Candles', 'Birthday Card'], sort_order: 2, is_default: false },
                    { id: 't58', product_id: product.id, name: 'Premium Setup', price: 2000, inclusions: ['Balloon ceiling decor', 'Hot air balloon treat box', 'Faux flowers arrangement', 'Petals and candles', 'Helium Balloons', 'Birthday Card'], sort_order: 3, is_default: false },
                    { id: 't59', product_id: product.id, name: 'Luxury Set Up', price: 3000, inclusions: ['Ceiling Deco', 'Balloon themed backdrop Heart', 'Neon birthday or decor themed signage', 'Helium Balloons', 'Fresh Flower bouquet', 'Large size hot air Balloon treat box', 'Medium size cake', 'Petals and Candles', 'Fireworks', 'Mini Teddy Bear', 'Personalized Birthday card'], sort_order: 4, is_default: false },
                    { id: 't60', product_id: product.id, name: 'Lavish Set Up', price: 5500, inclusions: ['Ceiling Deco', 'Floral love shaped backdrop', 'Lighted Marquees number theme', 'Petals and candles', 'Helium Balloons', '100cm Teddy Bear', '₵1,000 Money Tower', 'Fresh Flower bouquet', 'Large size hot air Balloon treat box', 'Large size cake/sparkle', 'Fireworks', 'Personalized Birthday card'], sort_order: 5, is_default: false },
                ]
            } else if (product.slug === 'surprise-packages') {
                tiresData = [
                    { id: 't61', product_id: product.id, name: '€1,000 Package', price: 1000, inclusions: ['Hot Air Balloon treat', 'Saxophone', 'Party Popper', 'Surprise Execution', 'Personalized Birthday card'], sort_order: 1, is_default: false },
                    { id: 't62', product_id: product.id, name: '€1,350 Package', price: 1350, inclusions: ['Hot air balloon treat', 'Saxophone', 'Mini faux bouquet', '3 helium balloons', 'Party popper', 'Surprise execution', 'Birthday Gift card'], sort_order: 2, is_default: false },
                    { id: 't63', product_id: product.id, name: '€1,500 Package', price: 1500, inclusions: ['Hot Air Balloon treat', '5 Set helium balloon', 'Saxophone', '4-in-One Cupcake', 'Fresh flowers (small)', 'Party Popper', 'Surprise Execution', 'Birthday Gifts card'], sort_order: 3, is_default: false },
                    { id: 't64', product_id: product.id, name: '€2,000 Package', price: 2000, inclusions: ['Large size balloon treat', '2 layer birthday cake', 'Medium size fresh flowers', 'Party Sparkles', 'Saxophone', 'Party popper', 'Fireworks', 'Personalized helium', 'Fruit basket', 'Surprise execution', 'Birthday gifts card'], sort_order: 4, is_default: false },
                    { id: 't65', product_id: product.id, name: '€3,000 Package', price: 3000, inclusions: ['Large size balloon treat', '2 layer birthday cake', 'Assorted breakfast / lunch basket', '£500 cash gifts', 'Medium size fresh flowers', 'Party Sparkles', 'Saxophone', 'Party popper', 'Fireworks', 'Personalized helium', 'Surprise execution', 'Birthday gifts card'], sort_order: 5, is_default: false },
                ]
            }

            // Mock addons
            addonsData = [
                { id: 'a1', name: 'Card', price: 30, description: 'Personalized birthday or occasion card.', is_active: true, created_at: '' },
                { id: 'a2', name: 'Customizable Ribbon', price: 50, description: 'Custom ribbon with personalized text or message.', is_active: true, created_at: '' },
                { id: 'a3', name: 'Champagne', price: 70, description: 'Premium champagne bottle.', is_active: true, created_at: '' },
                { id: 'a4', name: 'Wine', price: 150, description: 'Bottle of fine wine.', is_active: true, created_at: '' },
            ]

            // Mock settings
            settingsData = { whatsapp_link: "https://wa.me/233245131057", phone: "0245131057" }
        }
    }

    if (!product) {
        notFound()
    }

    return (
        <ProductDetailClient
            product={product as any}
            tiers={tiresData}
            addons={addonsData}
            priceRows={pricesData}
            images={imagesData}
            settings={settingsData}
        />
    )
}
