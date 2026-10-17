'use client'

import { useState } from 'react'
import { Lock, Mail, ArrowRight, X, Languages } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useAdminLanguage } from '@/contexts/AdminLanguageContext'

interface AdminLoginProps {
  onClose: () => void
  onLogin: () => void
}

export function AdminLogin({ onClose, onLogin }: AdminLoginProps) {
  const { t, locale, setLocale } = useAdminLanguage()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

 const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // لو الـ loading شغالة بالفعل، اخرج فوراً عشان ما يبعتش الطلب مرتين
    if (loading) return 

    if (!email || !password) {
      toast.error(t('login_validation'))
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success(t('login_success'))
        onLogin() // انتقال مباشر بدون تكرار
      } else {
        toast.error(data.error || data.message || t('login_error'))
        setLoading(false) // رجع الزرار لو فيه خطأ
      }
    } catch (error) {
      toast.error(t('admin_error_retry'))
      setLoading(false)
    }
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* رأس */}
        <div className="gradient-primary p-8 text-center relative">
          <button
            onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')}
            className="absolute top-4 right-4 h-9 px-3 rounded-lg bg-white/20 hover:bg-white/30 flex items-center gap-1.5 text-white text-sm transition-colors"
            aria-label={t('lang_switch')}
          >
            <Languages className="w-4 h-4" />
            {t('lang_switch')}
          </button>
          <button
            onClick={onClose}
            className="absolute top-4 left-4 w-9 h-9 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            aria-label={t('admin_close')}
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <img
            src="/logo.png"
            alt={t('company_name')}
            className="w-16 h-16 rounded-2xl mx-auto mb-4 shadow-lg"
          />
          <h2 className="text-2xl font-bold text-white mb-1">{t('login_title')}</h2>
          <p className="text-white/80 text-sm">{t('login_subtitle')}</p>
        </div>

        {/* النموذج */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              {t('login_email')}
            </Label>
            <div className="relative">
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="pr-10 text-right"
                dir="ltr"
                autoFocus
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              {t('login_password')}
            </Label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('login_password_placeholder')}
                className="pr-10 text-right"
                dir="ltr"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full gradient-primary text-white text-lg py-6"
          >
            {loading ? (
              t('login_loading')
            ) : (
              <>
                {t('login_button')}
                <ArrowRight className="w-5 h-5 mr-2" />
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}