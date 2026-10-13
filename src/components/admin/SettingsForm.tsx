'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Save, Loader2, Image as ImageIcon, Upload, Video, Trash2, Plus, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { useAdminLanguage } from '@/contexts/AdminLanguageContext'
import type { SiteSettings } from '@/lib/types'
import { upload } from '@vercel/blob/client'

interface SettingsFormProps {
  settings: SiteSettings | null
  onClose: () => void
  onSaved: () => void
}

interface AboutStatForm {
  value: string
  label: string
  labelEn?: string
}

const DEFAULT_ABOUT_POINTS = [
  'تصنيع محلي بأعلى المعايير العالمية',
  'فريق فني متخصص للتركيب والصيانة',
  'ضمان شامل على جميع المنتجات',
  'خدمة ما بعد البيع على مدار الساعة',
  'تقنيات تبريد موفرة للطاقة',
  'تصاميم مخصصة حسب الطلب',
]

const DEFAULT_ABOUT_POINTS_EN = [
  'Local manufacturing with highest global standards',
  'Specialized technical team for installation and maintenance',
  'Comprehensive warranty on all products',
  '24/7 after-sales service',
  'Energy-saving cooling technologies',
  'Custom designs upon request',
]

const DEFAULT_ABOUT_STATS: AboutStatForm[] = [
  { value: '500+', label: 'عميل سعيد', labelEn: 'Happy Clients' },
  { value: '15+', label: 'سنة خبرة', labelEn: 'Years Experience' },
  { value: '50+', label: 'نموذج منتج', labelEn: 'Product Models' },
  { value: '1000+', label: 'طلب تم تسليمه', labelEn: 'Delivered Orders' },
]

export function SettingsForm({ settings, onClose, onSaved }: SettingsFormProps) {
  const { t } = useAdminLanguage()
  const [loading, setLoading] = useState(false)
  const [uploadingHero, setUploadingHero] = useState(false)
  const [uploadingAbout, setUploadingAbout] = useState(false)
  const [uploadingAboutVideo, setUploadingAboutVideo] = useState(false)
  const heroFileInputRef = useRef<HTMLInputElement>(null)
  const aboutFileInputRef = useRef<HTMLInputElement>(null)
  const aboutVideoFileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    heroTitle: '',
    heroTitleEn: '',
    heroSubtitle: '',
    heroSubtitleEn: '',
    heroImage: '',
    heroImages: [] as string[],
    aboutTitle: '',
    aboutTitleEn: '',
    aboutText: '',
    aboutTextEn: '',
    aboutImage: '',
    aboutVideo: '',
    aboutHeadingHighlight: '',
    aboutHeadingHighlightEn: '',
    aboutHeadingRest: '',
    aboutHeadingRestEn: '',
    aboutPoints: [...DEFAULT_ABOUT_POINTS] as string[],
    aboutPointsEn: [...DEFAULT_ABOUT_POINTS_EN] as string[],
    aboutStats: DEFAULT_ABOUT_STATS.map((s) => ({ ...s })) as AboutStatForm[],
    productsBadge: '',
    productsBadgeEn: '',
    productsHeadingRest: '',
    productsHeadingRestEn: '',
    productsHeadingHighlight: '',
    productsHeadingHighlightEn: '',
    productsText: '',
    productsTextEn: '',
    showcaseTitle: '',
    showcaseTitleEn: '',
    showcaseSubtitle: '',
    showcaseSubtitleEn: '',
    phone: '',
    email: '',
    address: '',
    mapLocation: '',
    workingHours: '',
    workingHoursEn: '',
    facebook: '',
    instagram: '',
    telegram: '',
    whatsapp: '',
    whatsappWelcomeMessage: '',
    whatsappWelcomeMessageEn: '',
    tiktok: '',
  })

  useEffect(() => {
    if (settings) {
      const existingImages: string[] = Array.isArray(settings.heroImages)
        ? settings.heroImages
        : settings.heroImage
        ? [settings.heroImage]
        : []

      const parsedPointsEn: string[] =
        Array.isArray(settings.aboutPointsEn) && settings.aboutPointsEn.length > 0
          ? settings.aboutPointsEn
          : [...DEFAULT_ABOUT_POINTS_EN]

      const parsedPoints: string[] =
        Array.isArray(settings.aboutPoints) && settings.aboutPoints.length > 0
          ? settings.aboutPoints
          : [...DEFAULT_ABOUT_POINTS]

      const parsedStats: AboutStatForm[] =
        Array.isArray(settings.aboutStats) && settings.aboutStats.length > 0
          ? settings.aboutStats
          : DEFAULT_ABOUT_STATS.map((s) => ({ ...s }))

      setFormData({
        heroTitle: settings.heroTitle || '',
        heroTitleEn: settings.heroTitleEn || '',
        heroSubtitle: settings.heroSubtitle || '',
        heroSubtitleEn: settings.heroSubtitleEn || '',
        heroImage: settings.heroImage || '',
        heroImages: existingImages,
        aboutTitle: settings.aboutTitle || '',
        aboutTitleEn: settings.aboutTitleEn || '',
        aboutText: settings.aboutText || '',
        aboutTextEn: settings.aboutTextEn || '',
        aboutImage: settings.aboutImage || '',
        aboutVideo: settings.aboutVideo || '',
        aboutHeadingHighlight: settings.aboutHeadingHighlight || 'مصنع متكامل',
        aboutHeadingHighlightEn: settings.aboutHeadingHighlightEn || 'Integrated Factory',
        aboutHeadingRest: settings.aboutHeadingRest || 'لتصنيع حلول التبريد',
        aboutHeadingRestEn: settings.aboutHeadingRestEn || 'For Cooling Solutions',
        aboutPoints: parsedPoints.length > 0 ? parsedPoints : [...DEFAULT_ABOUT_POINTS],
        aboutPointsEn: parsedPointsEn.length > 0 ? parsedPointsEn : [...DEFAULT_ABOUT_POINTS_EN],
        aboutStats: parsedStats.length > 0 ? parsedStats : DEFAULT_ABOUT_STATS.map((s) => ({ ...s })),
        productsBadge: settings.productsBadge || 'منتجاتنا',
        productsBadgeEn: settings.productsBadgeEn || 'Our Products',
        productsHeadingRest: settings.productsHeadingRest || 'تشكيلتنا من',
        productsHeadingRestEn: settings.productsHeadingRestEn || 'Our Collection Of',
        productsHeadingHighlight: settings.productsHeadingHighlight || 'الثلاجات والفريزرات',
        productsHeadingHighlightEn: settings.productsHeadingHighlightEn || 'Refrigerators & Freezers',
        productsText: settings.productsText || '',
        productsTextEn: settings.productsTextEn || '',
        showcaseTitle: settings.showcaseTitle || '',
        showcaseTitleEn: settings.showcaseTitleEn || '',
        showcaseSubtitle: settings.showcaseSubtitle || '',
        showcaseSubtitleEn: settings.showcaseSubtitleEn || '',
        phone: settings.phone || '',
        email: settings.email || '',
        address: settings.address || '',
        mapLocation: settings.mapLocation || '',
        workingHours: settings.workingHours || '',
        workingHoursEn: settings.workingHoursEn || '',
        facebook: settings.facebook || '',
        instagram: settings.instagram || '',
        telegram: settings.telegram || '',
        whatsapp: settings.whatsapp || '',
        whatsappWelcomeMessage: settings.whatsappWelcomeMessage || '',
        whatsappWelcomeMessageEn: settings.whatsappWelcomeMessageEn || '',
        tiktok: settings.tiktok || '',
      })
    }
  }, [settings])

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handlePointChange = (index: number, value: string, lang: 'ar' | 'en') => {
    setFormData((prev) => {
      if (lang === 'ar') {
        const newPoints = [...prev.aboutPoints]
        newPoints[index] = value
        return { ...prev, aboutPoints: newPoints }
      } else {
        const newPointsEn = [...prev.aboutPointsEn]
        newPointsEn[index] = value
        return { ...prev, aboutPointsEn: newPointsEn }
      }
    })
  }

  const addPoint = () => {
    setFormData((prev) => ({
      ...prev,
      aboutPoints: [...prev.aboutPoints, ''],
      aboutPointsEn: [...prev.aboutPointsEn, ''],
    }))
  }

  const removePoint = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      aboutPoints: prev.aboutPoints.filter((_, i) => i !== index),
      aboutPointsEn: prev.aboutPointsEn.filter((_, i) => i !== index),
    }))
  }

  const handleStatChange = (index: number, field: 'value' | 'label' | 'labelEn', value: string) => {
    setFormData((prev) => {
      const newStats = [...prev.aboutStats]
      newStats[index] = { ...newStats[index], [field]: value }
      return { ...prev, aboutStats: newStats }
    })
  }

  
const uploadFile = async (file: File): Promise<string | null> => {
  try {
    const isImage = file.type.startsWith('image/')
    const isVideo = file.type.startsWith('video/')

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'video/mp4',
      'video/webm',
      'video/ogg',
    ]

    if (!allowedTypes.includes(file.type)) {
      toast.error('نوع الملف غير مدعوم')
      return null
    }

    const maxSize = isVideo
      ? 50 * 1024 * 1024
      : 5 * 1024 * 1024

    if (file.size > maxSize) {
      toast.error(
        isVideo
          ? 'حجم الفيديو يجب ألا يتجاوز 50 ميجابايت'
          : 'حجم الصورة يجب ألا يتجاوز 5 ميجابايت'
      )
      return null
    }

    const folder = isVideo ? 'videos' : 'images'
    const pathname = `${folder}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`

    const blob = await upload(pathname, file, {
      access: 'public',
      handleUploadUrl: '/api/upload/prepare',
    })

    return blob.url
  } catch (error) {
    console.error('Upload failed:', error)
    toast.error(t('settings_form_upload_error'))
    return null
  }
}


  const handleHeroImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploadingHero(true)
    const uploadedUrls: string[] = []
    for (const file of Array.from(files)) {
      const url = await uploadFile(file)
      if (url) uploadedUrls.push(url)
    }
    setUploadingHero(false)

    if (uploadedUrls.length > 0) {
      setFormData((prev) => {
        const newImages = [...prev.heroImages, ...uploadedUrls]
        return {
          ...prev,
          heroImages: newImages,
          heroImage: prev.heroImage || newImages[0] || '',
        }
      })
      toast.success(t('settings_form_image_upload_success'))
    }
    if (heroFileInputRef.current) heroFileInputRef.current.value = ''
  }

  const removeHeroImage = (index: number) => {
    setFormData((prev) => {
      const newImages = prev.heroImages.filter((_, i) => i !== index)
      return {
        ...prev,
        heroImages: newImages,
        heroImage: newImages[0] || '',
      }
    })
  }

  const moveHeroImage = (index: number, direction: 'left' | 'right') => {
    setFormData((prev) => {
      const newImages = [...prev.heroImages]
      const targetIndex = direction === 'right' ? index + 1 : index - 1
      if (targetIndex < 0 || targetIndex >= newImages.length) return prev
      ;[newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]]
      return { ...prev, heroImages: newImages, heroImage: newImages[0] || '' }
    })
  }

  const handleAboutImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingAbout(true)
    const url = await uploadFile(file)
    setUploadingAbout(false)
    if (url) {
      handleChange('aboutImage', url)
      toast.success(t('settings_form_image_upload_success'))
    }
    if (aboutFileInputRef.current) aboutFileInputRef.current.value = ''
  }

  const handleAboutVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingAboutVideo(true)
    const url = await uploadFile(file)
    setUploadingAboutVideo(false)
    if (url) {
      handleChange('aboutVideo', url)
      toast.success(t('settings_form_video_upload_success'))
    }
    if (aboutVideoFileInputRef.current) aboutVideoFileInputRef.current.value = ''
  }

  const removeAboutImage = () => {
    handleChange('aboutImage', '')
  }

  const removeAboutVideo = () => {
    handleChange('aboutVideo', '')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        ...formData,
        aboutPoints: formData.aboutPoints.map((p) => p.trim()).filter(Boolean),
        aboutPointsEn: formData.aboutPointsEn.map((p) => p.trim()).filter(Boolean),
      }

      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        toast.success(t('settings_form_save_success'))
        onSaved()
      } else {
        toast.error(t('settings_form_save_error'))
      }
    } catch (error) {
      toast.error(t('admin_error_retry'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* الرأس */}
        <div className="flex items-center justify-between p-6 border-b bg-muted/30">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            {t('settings_form_title')}
          </h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
            aria-label={t('admin_close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* النموذج */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* 1. القسم الرئيسي (Hero) */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-2 pb-2 border-b">
              <span className="w-1 h-6 bg-primary rounded-full" />
              {t('settings_form_section_hero')}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="heroTitle">{t('settings_form_hero_title_ar')}</Label>
                <Input
                  id="heroTitle"
                  value={formData.heroTitle}
                  onChange={(e) => handleChange('heroTitle', e.target.value)}
                  placeholder="مصنع مكة للثلاجات"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="heroTitleEn">{t('settings_form_hero_title_en')}</Label>
                <Input
                  id="heroTitleEn"
                  value={formData.heroTitleEn}
                  onChange={(e) => handleChange('heroTitleEn', e.target.value)}
                  placeholder="Makkah Refrigerators Factory"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="heroSubtitle">{t('settings_form_hero_subtitle_ar')}</Label>
                <Textarea
                  id="heroSubtitle"
                  value={formData.heroSubtitle}
                  onChange={(e) => handleChange('heroSubtitle', e.target.value)}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="heroSubtitleEn">{t('settings_form_hero_subtitle_en')}</Label>
                <Textarea
                  id="heroSubtitleEn"
                  value={formData.heroSubtitleEn}
                  onChange={(e) => handleChange('heroSubtitleEn', e.target.value)}
                  rows={2}
                  dir="ltr"
                />
              </div>
            </div>

            {/* صور الكاروسيل */}
            <div className="space-y-2">
              <Label>{t('settings_form_hero_images_label')}</Label>
              {formData.heroImages.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-2">
                  {formData.heroImages.map((img, idx) => (
                    <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden bg-muted border">
                      <img src={img} alt={`صورة ${idx + 1}`} className="w-full h-full object-cover" />
                      {idx === 0 && (
                        <span className="absolute bottom-1 right-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded">
                          {t('settings_form_hero_images_first')}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeHeroImage(idx)}
                        className="absolute top-1 left-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <div className="absolute inset-x-0 bottom-0 flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pb-1">
                        <button
                          type="button"
                          onClick={() => moveHeroImage(idx, 'right')}
                          disabled={idx === formData.heroImages.length - 1}
                          className="w-5 h-5 rounded bg-black/60 text-white text-xs flex items-center justify-center disabled:opacity-30"
                        >
                          &rsaquo;
                        </button>
                        <button
                          type="button"
                          onClick={() => moveHeroImage(idx, 'left')}
                          disabled={idx === 0}
                          className="w-5 h-5 rounded bg-black/60 text-white text-xs flex items-center justify-center disabled:opacity-30"
                        >
                          &lsaquo;
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <input
                ref={heroFileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleHeroImagesUpload}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => heroFileInputRef.current?.click()}
                disabled={uploadingHero}
                className="mt-2"
              >
                {uploadingHero ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <Upload className="w-4 h-4 ml-2" />}
                {t('settings_form_hero_images_add')}
              </Button>
            </div>
          </div>

          {/* 2. قسم منتجاتنا */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-2 pb-2 border-b">
              <span className="w-1 h-6 bg-primary rounded-full" />
              {t('settings_form_section_products')}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="productsBadge">{t('settings_form_products_badge_ar')}</Label>
                <Input
                  id="productsBadge"
                  value={formData.productsBadge}
                  onChange={(e) => handleChange('productsBadge', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="productsBadgeEn">{t('settings_form_products_badge_en')}</Label>
                <Input
                  id="productsBadgeEn"
                  value={formData.productsBadgeEn}
                  onChange={(e) => handleChange('productsBadgeEn', e.target.value)}
                  dir="ltr"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="productsHeadingRest">{t('settings_form_products_heading_rest_ar')}</Label>
                <Input
                  id="productsHeadingRest"
                  value={formData.productsHeadingRest}
                  onChange={(e) => handleChange('productsHeadingRest', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="productsHeadingRestEn">{t('settings_form_products_heading_rest_en')}</Label>
                <Input
                  id="productsHeadingRestEn"
                  value={formData.productsHeadingRestEn}
                  onChange={(e) => handleChange('productsHeadingRestEn', e.target.value)}
                  dir="ltr"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="productsHeadingHighlight">{t('settings_form_products_heading_highlight_ar')}</Label>
                <Input
                  id="productsHeadingHighlight"
                  value={formData.productsHeadingHighlight}
                  onChange={(e) => handleChange('productsHeadingHighlight', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="productsHeadingHighlightEn">{t('settings_form_products_heading_highlight_en')}</Label>
                <Input
                  id="productsHeadingHighlightEn"
                  value={formData.productsHeadingHighlightEn}
                  onChange={(e) => handleChange('productsHeadingHighlightEn', e.target.value)}
                  dir="ltr"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="productsText">{t('settings_form_products_text_ar')}</Label>
                <Textarea
                  id="productsText"
                  value={formData.productsText}
                  onChange={(e) => handleChange('productsText', e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="productsTextEn">{t('settings_form_products_text_en')}</Label>
                <Textarea
                  id="productsTextEn"
                  value={formData.productsTextEn}
                  onChange={(e) => handleChange('productsTextEn', e.target.value)}
                  rows={3}
                  dir="ltr"
                />
              </div>
            </div>
          </div>

          {/* 2.5. قسم العرض التفاعلي */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-2 pb-2 border-b">
              <span className="w-1 h-6 bg-primary rounded-full" />
              {t('settings_form_section_showcase')}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="showcaseTitle">{t('settings_form_showcase_title_ar')}</Label>
                <Input
                  id="showcaseTitle"
                  value={formData.showcaseTitle}
                  onChange={(e) => handleChange('showcaseTitle', e.target.value)}
                  placeholder="استكشف منتجاتنا"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="showcaseTitleEn">{t('settings_form_showcase_title_en')}</Label>
                <Input
                  id="showcaseTitleEn"
                  value={formData.showcaseTitleEn}
                  onChange={(e) => handleChange('showcaseTitleEn', e.target.value)}
                  placeholder="Explore Our Products"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="showcaseSubtitle">{t('settings_form_showcase_subtitle_ar')}</Label>
                <Textarea
                  id="showcaseSubtitle"
                  value={formData.showcaseSubtitle}
                  onChange={(e) => handleChange('showcaseSubtitle', e.target.value)}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="showcaseSubtitleEn">{t('settings_form_showcase_subtitle_en')}</Label>
                <Textarea
                  id="showcaseSubtitleEn"
                  value={formData.showcaseSubtitleEn}
                  onChange={(e) => handleChange('showcaseSubtitleEn', e.target.value)}
                  rows={2}
                  dir="ltr"
                />
              </div>
            </div>
          </div>

          {/* 3. قسم من نحن */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-2 pb-2 border-b">
              <span className="w-1 h-6 bg-primary rounded-full" />
              {t('settings_form_section_about')}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="aboutTitle">{t('settings_form_about_title_ar')}</Label>
                <Input
                  id="aboutTitle"
                  value={formData.aboutTitle}
                  onChange={(e) => handleChange('aboutTitle', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="aboutTitleEn">{t('settings_form_about_title_en')}</Label>
                <Input
                  id="aboutTitleEn"
                  value={formData.aboutTitleEn}
                  onChange={(e) => handleChange('aboutTitleEn', e.target.value)}
                  dir="ltr"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="aboutHeadingHighlight">{t('settings_form_about_heading_highlight_ar')}</Label>
                <Input
                  id="aboutHeadingHighlight"
                  value={formData.aboutHeadingHighlight}
                  onChange={(e) => handleChange('aboutHeadingHighlight', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="aboutHeadingHighlightEn">{t('settings_form_about_heading_highlight_en')}</Label>
                <Input
                  id="aboutHeadingHighlightEn"
                  value={formData.aboutHeadingHighlightEn}
                  onChange={(e) => handleChange('aboutHeadingHighlightEn', e.target.value)}
                  dir="ltr"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="aboutHeadingRest">{t('settings_form_about_heading_rest_ar')}</Label>
                <Input
                  id="aboutHeadingRest"
                  value={formData.aboutHeadingRest}
                  onChange={(e) => handleChange('aboutHeadingRest', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="aboutHeadingRestEn">{t('settings_form_about_heading_rest_en')}</Label>
                <Input
                  id="aboutHeadingRestEn"
                  value={formData.aboutHeadingRestEn}
                  onChange={(e) => handleChange('aboutHeadingRestEn', e.target.value)}
                  dir="ltr"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="aboutText">{t('settings_form_about_text_ar')}</Label>
                <Textarea
                  id="aboutText"
                  value={formData.aboutText}
                  onChange={(e) => handleChange('aboutText', e.target.value)}
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="aboutTextEn">{t('settings_form_about_text_en')}</Label>
                <Textarea
                  id="aboutTextEn"
                  value={formData.aboutTextEn}
                  onChange={(e) => handleChange('aboutTextEn', e.target.value)}
                  rows={4}
                  dir="ltr"
                />
              </div>
            </div>

            {/* النقاط المميزة (عربي وإنجليزي) */}
            <div className="space-y-3">
              <Label>{t('settings_form_points_label')}</Label>
              <div className="space-y-3">
                {formData.aboutPoints.map((point, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center bg-muted/20 p-2 rounded-lg border">
                    <div className="md:col-span-5">
                      <Input
                        value={point}
                        onChange={(e) => handlePointChange(idx, e.target.value, 'ar')}
                        placeholder={`نقطة ${idx + 1} (عربي)`}
                      />
                    </div>
                    <div className="md:col-span-6">
                      <Input
                        value={formData.aboutPointsEn[idx] || ''}
                        onChange={(e) => handlePointChange(idx, e.target.value, 'en')}
                        placeholder={`Point ${idx + 1} (English)`}
                        dir="ltr"
                      />
                    </div>
                    <div className="md:col-span-1 flex justify-center">
                      <button
                        type="button"
                        onClick={() => removePoint(idx)}
                        className="w-9 h-9 rounded-lg hover:bg-destructive/10 text-destructive flex items-center justify-center transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addPoint} className="mt-1">
                <Plus className="w-4 h-4 ml-2" />
                {t('settings_form_add_point')}
              </Button>
            </div>

            {/* الإحصائيات الأربعة */}
            <div className="space-y-2">
              <Label>{t('settings_form_stats_label')}</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {formData.aboutStats.map((stat, idx) => (
                  <div key={idx} className="border rounded-xl p-3 space-y-2 bg-muted/20">
                    <div className="space-y-1">
                      <Label className="text-xs">{t('settings_form_stat_value_label')}</Label>
                      <Input
                        value={stat.value}
                        onChange={(e) => handleStatChange(idx, 'value', e.target.value)}
                        dir="ltr"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs">{t('settings_form_stat_label_ar')}</Label>
                        <Input
                          value={stat.label}
                          onChange={(e) => handleStatChange(idx, 'label', e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">{t('settings_form_stat_label_en')}</Label>
                        <Input
                          value={stat.labelEn || ''}
                          onChange={(e) => handleStatChange(idx, 'labelEn', e.target.value)}
                          dir="ltr"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* رفع صورة وفيديو قسم من نحن */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <Label>{t('settings_form_about_image_label')}</Label>
                <div className="flex items-center gap-3">
                  {formData.aboutImage && (
                    <div className="relative w-16 h-12 rounded-lg overflow-hidden border">
                      <img src={formData.aboutImage} alt="preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={removeAboutImage}
                        className="absolute top-1 left-1 w-4 h-4 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  )}
                  <input ref={aboutFileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAboutImageUpload} />
                  <Button type="button" variant="outline" size="sm" onClick={() => aboutFileInputRef.current?.click()} disabled={uploadingAbout}>
                    <Upload className="w-4 h-4 ml-2" />
                    {formData.aboutImage ? t('settings_form_image_change') : t('settings_form_image_upload')}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t('settings_form_about_video_label')}</Label>
                <div className="flex items-center gap-3">
                  {formData.aboutVideo && (
                    <div className="relative w-16 h-12 rounded-lg overflow-hidden border bg-black">
                      <video src={formData.aboutVideo} className="w-full h-full object-cover" muted />
                      <button
                        type="button"
                        onClick={removeAboutVideo}
                        className="absolute top-1 left-1 w-4 h-4 rounded-full bg-black/60 text-white flex items-center justify-center"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  )}
                  <input ref={aboutVideoFileInputRef} type="file" accept="video/*" className="hidden" onChange={handleAboutVideoUpload} />
                  <Button type="button" variant="outline" size="sm" onClick={() => aboutVideoFileInputRef.current?.click()} disabled={uploadingAboutVideo}>
                    <Video className="w-4 h-4 ml-2" />
                    {formData.aboutVideo ? t('settings_form_video_change') : t('settings_form_video_upload')}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* 4. معلومات التواصل */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-2 pb-2 border-b">
              <span className="w-1 h-6 bg-primary rounded-full" />
              {t('settings_form_section_contact')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">{t('settings_form_phone')}</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+966 12 345 6789"
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t('settings_form_email')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="info@example.com"
                  dir="ltr"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">{t('settings_form_address')}</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="العنوان الكامل"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mapLocation">{t('settings_form_map_location')}</Label>
              <Input
                id="mapLocation"
                value={formData.mapLocation}
                onChange={(e) => handleChange('mapLocation', e.target.value)}
                placeholder="مكة المكرمة، المنطقة الصناعية"
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workingHours">{t('settings_form_working_hours')}</Label>
              <Input
                id="workingHours"
                value={formData.workingHours}
                onChange={(e) => handleChange('workingHours', e.target.value)}
                placeholder="السبت - الخميس: 9 صباحاً - 6 مساءً"
              />
            </div>
          </div>

         {/* 5. التواصل الاجتماعي */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-2 pb-2 border-b">
              <span className="w-1 h-6 bg-primary rounded-full" />
              {t('settings_form_section_social')}
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="whatsapp">{t('settings_form_whatsapp')}</Label>
                <Input
                  id="whatsapp"
                  value={formData.whatsapp}
                  onChange={(e) => handleChange('whatsapp', e.target.value)}
                  placeholder="+966500000000"
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="facebook">{t('settings_form_facebook')}</Label>
                <Input
                  id="facebook"
                  type="url"
                  value={formData.facebook}
                  onChange={(e) => handleChange('facebook', e.target.value)}
                  placeholder="https://facebook.com/..."
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instagram">{t('settings_form_instagram')}</Label>
                <Input
                  id="instagram"
                  type="url"
                  value={formData.instagram}
                  onChange={(e) => handleChange('instagram', e.target.value)}
                  placeholder="https://instagram.com/..."
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telegram">{t('settings_form_telegram')}</Label>
                <Input
                  id="telegram"
                  type="url"
                  value={formData.telegram}
                  onChange={(e) => handleChange('telegram', e.target.value)}
                  placeholder="https://t.me/..."
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tiktok">{t('settings_form_tiktok') || 'رابط تيك توك'}</Label>
                <Input
                  id="tiktok"
                  type="url"
                  value={formData.tiktok}
                  onChange={(e) => handleChange('tiktok', e.target.value)}
                  placeholder="https://tiktok.com/@..."
                  dir="ltr"
                />
              </div>
            </div>
          </div>

        </form>

        {/* الأزرار في الأسفل */}
        <div className="flex gap-3 p-6 border-t bg-muted/30">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            {t('admin_cancel')}
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 gradient-primary text-white"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                {t('admin_saving')}
              </>
            ) : (
              <>
                <Save className="w-4 h-4 ml-2" />
                {t('admin_save')}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}