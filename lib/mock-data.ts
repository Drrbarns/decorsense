
export const MOCK_CATEGORIES = [
    { id: '1', name: 'Money Bouquets', slug: 'money-bouquets', sort_order: 1, is_active: true, created_at: '', updated_at: '', is_featured: true, image_url: '/hero-bg-2.png', description: '' },
    { id: '2', name: 'Flower Boxes', slug: 'flower-boxes', sort_order: 2, is_active: true, created_at: '', updated_at: '', is_featured: true, image_url: '/hero-bg.png', description: '' },
    { id: '3', name: 'Gift Hampers', slug: 'gift-hampers', sort_order: 3, is_active: true, created_at: '', updated_at: '', is_featured: false, image_url: '/hero-bg-3.png', description: '' },
    { id: '4', name: 'Balloon Decor', slug: 'balloon-decor', sort_order: 4, is_active: true, created_at: '', updated_at: '', is_featured: false, image_url: '/gallery-balloons.png', description: '' },
]

export const MOCK_PRODUCTS = [
    {
        id: '101', name: 'Classic Money Rose', slug: 'classic-money-rose',
        category_id: '1', price: 200, pricing_type: 'AMOUNT_SERVICE_CHARGE',
        short_desc: 'Beautifully folded banknotes shaped into roses.', long_desc: '',
        is_active: true, is_featured: true, created_at: '', updated_at: '',
        price_min: null, price_max: null, currency: 'GHS', tags: [],
        images: ['/hero-bg-2.png'],
        categories: { name: 'Money Bouquets' }
    },
    {
        id: '102', name: 'Luxury Red Roses Box', slug: 'luxury-red-roses',
        category_id: '2', price: 450, pricing_type: 'FIXED',
        short_desc: 'Premium fresh red roses in a black velvet box.', long_desc: '',
        is_active: true, is_featured: true, created_at: '', updated_at: '',
        price_min: null, price_max: null, currency: 'GHS', tags: [],
        images: ['/hero-bg.png'],
        categories: { name: 'Flower Boxes' }
    },
    {
        id: '103', name: 'Birthday Surprise Package', slug: 'birthday-surprise',
        category_id: '3', price: 600, pricing_type: 'FIXED',
        short_desc: 'Includes cake, chocolates, wine, and balloons.', long_desc: '',
        is_active: true, is_featured: true, created_at: '', updated_at: '',
        price_min: null, price_max: null, currency: 'GHS', tags: [],
        images: ['/hero-bg-3.png'],
        categories: { name: 'Gift Hampers' }
    },
    {
        id: '104', name: 'Romantic Room Decor', slug: 'room-decor',
        category_id: '4', price: 800, pricing_type: 'RANGE',
        short_desc: 'Full room decoration with petals, candles, and balloons.', long_desc: '',
        is_active: true, is_featured: true, created_at: '', updated_at: '',
        price_min: 600, price_max: 2000, currency: 'GHS', tags: [],
        images: ['/product-room-decor.png'],
        categories: { name: 'Balloon Decor' }
    },
]

export const MOCK_ORDERS = [
    { id: '1', customer_name: 'John Doe', status: 'pending', total_amount: 450, created_at: '2023-10-25T10:00:00Z', items: 'Luxury Red Roses Box' },
    { id: '2', customer_name: 'Jane Smith', status: 'completed', total_amount: 800, created_at: '2023-10-24T14:30:00Z', items: 'Romantic Room Decor' },
]

export const MOCK_GALLERY = [
    { id: '1', media_type: 'image', url: '/gallery-hamper.png', caption: 'Luxury Christmas Hamper', is_active: true, sort_order: 1 },
    { id: '2', media_type: 'image', url: '/gallery-balloons.png', caption: 'Luxury Balloon Decor', is_active: true, sort_order: 2 },
    { id: '3', media_type: 'image', url: '/hero-bg-2.png', caption: 'Gold & Red Money Bouquet', is_active: true, sort_order: 3 },
]
