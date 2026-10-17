'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Save, Loader2, Upload, ImageIcon, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { useAdminLanguage } from '@/contexts/AdminLanguageContext'
import type { Product } from '@/lib/types'
import { uploadFileToCloudinary } from '@/lib/upload'

interface ProductFormProps {
  product: Product | null
  onClose: () => void
  onSaved: () => void
}
function cleanText(text: string | null | undefined): string {
  if (!text) return ''
  return text
    .replace(/[\u200B-\u200F\u202A-\u202E\uFEFF]/g, '')
    .trim()
    .normalize('NFC')
}

export function ProductForm({ product, onClose, onSaved }: ProductFormProps) {
  const { t, locale } = useAdminLanguage()
  const isAdminEn = locale === 'en'
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [categories, setCategories] = useState<{ id: string; name: string; nameEn?: string | null }[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)

  const [formData, setFormData] = useState({
    name: '',
    nameEn: '',
    description: '',
    descriptionEn: '',
    price: '',
    compareAtPrice: '', // <--- أضفنا حقل السعر القديم هنا
    imageUrl: '',
    category: '',
    categoryEn: '',
    capacity: '',
    capacityEn: '',
    temperature: '',
    temperatureEn: '',
    power: '',
    powerEn: '',
    featured: false,
    inStock: true,
    showPrice: true,
  })

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch('/api/categories')
        const data = await res.json()
        if (res.ok) {
          let cats = (data.categories as { id: string; name: string; nameEn?: string | null }[]).map((c) => ({
            ...c,
            name: cleanText(c.name),
          }))

          const productCategoryClean = cleanText(product?.category)

          if (productCategoryClean && !cats.some((c) => c.name === productCategoryClean)) {
            cats = [{ id: '__current__', name: productCategoryClean, nameEn: product?.categoryEn || '' }, ...cats]
          }

          setCategories(cats)

          if (!product && cats.length > 0) {
            setFormData((prev) => ({
              ...prev,
              category: prev.category || cats[0].name,
              categoryEn: prev.categoryEn || cats[0].nameEn || '',
            }))
          }
        }
      } finally {
        setCategoriesLoading(false)
      }
    }
    loadCategories()
  }, [product])

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        nameEn: product.nameEn || '',
        description: product.description,
        descriptionEn: product.descriptionEn || '',
        price: product.price.toString(),
        compareAtPrice: product.compareAtPrice ? product.compareAtPrice.toString() : '', // <--- تعبئة السعر القديم عند التعديل
        imageUrl: product.imageUrl,
        category: cleanText(product.category),
        categoryEn: product.categoryEn || '',
        capacity: product.capacity || '',
        capacityEn: product.capacityEn || '',
        temperature: product.temperature || '',
        temperatureEn: product.temperatureEn || '',
        power: product.power || '',
        powerEn: product.powerEn || '',
        featured: product.featured,
        inStock: product.inStock,
        showPrice: product.showPrice,
      })
    }
  }, [product])

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleCategoryChange = (name: string) => {
    const found = categories.find((c) => c.name === name)
    setFormData((prev) => ({
      ...prev,
      category: name,
      categoryEn: found?.nameEn || prev.categoryEn,
    }))
  }
  const handleCategoryChangeEn = (nameEn: string) => {
  const found = categories.find((c) => c.nameEn === nameEn)
  setFormData((prev) => ({
    ...prev,
    categoryEn: nameEn,
    category: found?.name || prev.category,
  }))
}

  
const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error(t('product_form_upload_invalid_type'))
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('product_form_upload_too_large'))
      return
    }

    setUploading(true)

    try {
      const url = await uploadFileToCloudinary(file)

      handleChange('imageUrl', url)
      toast.success(t('product_form_upload_success'))
    } catch (error) {
      console.error('Product image upload failed:', error)
      toast.error(t('product_form_upload_error'))
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleRemoveImage = () => {
    handleChange('imageUrl', '')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.description || !formData.price) {
      toast.error(t('product_form_validation'))
      return
    }

    setLoading(true)
    try {
      const url = product ? `/api/products/${product.id}` : '/api/products'
      const method = product ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
          compareAtPrice: formData.compareAtPrice ? Number(formData.compareAtPrice) : null,
        }),
      })

      if (res.ok) {
        toast.success(product ? t('product_form_success_edit') : t('product_form_success_add'))
        onSaved()
      } else {
        const data = await res.json()
        toast.error(data.error || t('admin_error'))
      }
    } catch (error) {
      toast.error(t('admin_error_retry'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b bg-muted/30">
          <h2 className="text-xl font-bold">
            {product ? t('product_form_edit_title') : t('product_form_add_title')}
          </h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
            aria-label={t('admin_close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* الاسم - عربي/إنجليزي جنب بعض */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('product_form_name_ar')}</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="مثال: ثلاجة عرض تجارية 1200 لتر"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nameEn">{t('product_form_name_en')}</Label>
              <Input
                id="nameEn"
                value={formData.nameEn}
                onChange={(e) => handleChange('nameEn', e.target.value)}
                placeholder="e.g. 1200L Commercial Display Fridge"
                dir="ltr"
              />
            </div>
          </div>

          {/* الوصف - عربي/إنجليزي جنب بعض */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="description">{t('product_form_desc_ar')}</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="وصف تفصيلي للمنتج ومميزاته"
                rows={4}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descriptionEn">{t('product_form_desc_en')}</Label>
              <Textarea
                id="descriptionEn"
                value={formData.descriptionEn}
                onChange={(e) => handleChange('descriptionEn', e.target.value)}
                placeholder="Detailed product description and features"
                rows={4}
                dir="ltr"
              />
            </div>
          </div>

          {/* الأسعار (السعر الحالي وسعر الخصم القديم) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">{t('product_form_price')}</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => handleChange('price', e.target.value)}
                placeholder="0"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="space-y-2">
            <Label>{t('product_form_compare_at_price')}</Label>
            <Input
              type="number"
              value={formData.compareAtPrice}
              onChange={(e) => handleChange('compareAtPrice', e.target.value)}
              placeholder="e.g. 1500"
            />
          </div>
          </div>

         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category">{t('product_form_category')}</Label>
            {isAdminEn ? (
              <Input
                id="category"
                value={formData.category}
                readOnly
                disabled
                dir="rtl"
                className="bg-muted/50 cursor-not-allowed"
              />
            ) : (
              <select
                id="category"
                value={formData.category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                disabled={categoriesLoading}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="" disabled>
                  {categoriesLoading ? t('product_form_category_loading') : t('product_form_category_select')}
                </option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            )}
          </div>

              <div className="space-y-2">
                <Label htmlFor="categoryEn">{t('product_form_category_en')}</Label>
                {isAdminEn ? (
                  <select
                    id="categoryEn"
                    value={formData.categoryEn}
                    onChange={(e) => handleCategoryChangeEn(e.target.value)}
                    disabled={categoriesLoading}
                    dir="ltr"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="" disabled>
                      {categoriesLoading ? t('product_form_category_loading') : t('product_form_category_select')}
                    </option>
                    {categories
                      .filter((cat) => !!cat.nameEn)
                      .map((cat) => (
                        <option key={cat.id} value={cat.nameEn as string}>
                          {cat.nameEn}
                        </option>
                      ))}
                  </select>
                ) : (
                  <Input
                    id="categoryEn"
                    value={formData.categoryEn}
                    onChange={(e) => handleChange('categoryEn', e.target.value)}
                    placeholder="e.g. Refrigerators"
                    dir="ltr"
                    disabled={!!categories.find((c) => c.name === formData.category)?.nameEn}
                    className={
                      categories.find((c) => c.name === formData.category)?.nameEn
                        ? 'bg-muted/50 cursor-not-allowed'
                        : ''
                    }
                  />
                )}
              </div>
            </div>

          <div className="space-y-2">
            <Label>{t('product_form_image')}</Label>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {formData.imageUrl ? (
              <div className="relative aspect-video rounded-lg overflow-hidden bg-muted border">
                <img
                  src={formData.imageUrl}
                  alt="معاينة"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 hover:opacity-100">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    <Upload className="w-4 h-4 ml-1" />
                    {t('product_form_image_change')}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                   onClick={() => handleChange('imageUrl', '')}
                    disabled={uploading}
                  >
                    <Trash2 className="w-4 h-4 ml-1" />
                    {t('product_form_image_delete')}
                  </Button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full aspect-video rounded-lg border-2 border-dashed border-muted-foreground/30 hover:border-primary hover:bg-muted/50 transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <span className="text-sm">{t('product_form_image_uploading')}</span>
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-8 h-8" />
                    <span className="text-sm">{t('product_form_image_upload_hint')}</span>
                    <span className="text-xs">{t('product_form_image_upload_max')}</span>
                  </>
                )}
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="capacity">{t('product_form_capacity_ar')}</Label>
              <Input
                id="capacity"
                value={formData.capacity}
                onChange={(e) => handleChange('capacity', e.target.value)}
                placeholder="مثال: 1200 لتر"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacityEn">{t('product_form_capacity_en')}</Label>
              <Input
                id="capacityEn"
                value={formData.capacityEn}
                onChange={(e) => handleChange('capacityEn', e.target.value)}
                placeholder="e.g. 1200 L"
                dir="ltr"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="temperature">{t('product_form_temp_ar')}</Label>
              <Input
                id="temperature"
                value={formData.temperature}
                onChange={(e) => handleChange('temperature', e.target.value)}
                placeholder="من +2 إلى +8"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="temperatureEn">{t('product_form_temp_en')}</Label>
              <Input
                id="temperatureEn"
                value={formData.temperatureEn}
                onChange={(e) => handleChange('temperatureEn', e.target.value)}
                placeholder="e.g. +2 to +8"
                dir="ltr"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="power">{t('product_form_power_ar')}</Label>
              <Input
                id="power"
                value={formData.power}
                onChange={(e) => handleChange('power', e.target.value)}
                placeholder="مثال: 450 واط"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="powerEn">{t('product_form_power_en')}</Label>
              <Input
                id="powerEn"
                value={formData.powerEn}
                onChange={(e) => handleChange('powerEn', e.target.value)}
                placeholder="e.g. 450 W"
                dir="ltr"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
              <div>
                <Label htmlFor="featured" className="font-medium cursor-pointer">
                  {t('product_form_featured')}
                </Label>
                <p className="text-xs text-muted-foreground">{t('product_form_featured_hint')}</p>
              </div>
              <Switch
                id="featured"
                checked={formData.featured}
                onCheckedChange={(checked) => handleChange('featured', checked)}
                className="data-[state=checked]:bg-emerald-600 data-[state=unchecked]:bg-gray-300"
              />
            </div>
            <div className="pt-2">
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                <div>
                  <Label htmlFor="showPrice" className="font-medium cursor-pointer">
                    {t('product_form_show_price')}
                  </Label>
                  <p className="text-xs text-muted-foreground">{t('product_form_show_price_hint')}</p>
                </div>
                <Switch
                  id="showPrice"
                  checked={formData.showPrice}
                  onCheckedChange={(checked) => handleChange('showPrice', checked)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
              <div>
                <Label htmlFor="inStock" className="font-medium cursor-pointer">
                  {t('product_form_in_stock')}
                </Label>
                <p className="text-xs text-muted-foreground">{t('product_form_in_stock_hint')}</p>
              </div>
              <Switch
                id="inStock"
                checked={formData.inStock}
                onCheckedChange={(checked) => handleChange('inStock', checked)}
              />
            </div>
          </div>
        </form>

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
            disabled={loading || uploading}
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
                {product ? t('admin_save') : t('product_form_add_title')}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}