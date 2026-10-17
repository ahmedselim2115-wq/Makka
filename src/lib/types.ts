export interface Product {
  id: string
  name: string
  nameEn: string | null
  description: string
  descriptionEn: string | null
  price: number
  compareAtPrice?: number | null
  imageUrl: string
  category: string
  categoryEn: string | null
  capacity: string | null
  capacityEn: string | null
  temperature: string | null
  temperatureEn: string | null
  power: string | null
  powerEn: string | null
  featured: boolean
  inStock: boolean
  showPrice: boolean
  createdAt: string
  updatedAt: string
}

export interface SiteSettings {
  id: string
  siteName?: string
  siteNameEn?: string
  heroTitle: string
  heroTitleEn?: string
  heroSubtitle: string
  heroSubtitleEn?: string
  heroImage: string
  heroImages?: string[]
  aboutTitle: string
  aboutTitleEn?: string
  aboutText: string
  aboutTextEn?: string
  aboutHeadingHighlight?: string
  aboutHeadingHighlightEn?: string
  aboutHeadingRest?: string
  aboutHeadingRestEn?: string
  aboutPoints?: any[]
  aboutPointsEn?: any[]
  aboutStats?: any[]
  aboutImage: string
  aboutVideo?: string
  productsBadge?: string
  productsBadgeEn?: string
  productsHeadingRest?: string
  productsHeadingRestEn?: string
  productsHeadingHighlight?: string
  productsHeadingHighlightEn?: string
  productsText?: string
  productsTextEn?: string
  phone: string
  email: string
  address: string
  addressEn?: string
  workingHours: string
  workingHoursEn?: string
  facebook: string
  instagram: string
  tiktok: string 
  telegram: string
  whatsapp: string
  whatsappWidgetEnabled?: boolean
  whatsappWelcomeMessage?: string
  whatsappWelcomeMessageEn?: string
  mapLocation?: string
  showcaseTitle?: string
  showcaseTitleEn?: string
  showcaseSubtitle?: string
  showcaseSubtitleEn?: string
  [key: string]: any
}

export interface Stats {
  totalProducts: number
  featuredProducts: number
  inStockProducts: number
  outOfStockProducts: number
}