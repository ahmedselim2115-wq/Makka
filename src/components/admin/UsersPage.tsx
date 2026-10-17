'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Pencil, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { UserForm } from './UserForm'
import { AVAILABLE_PERMISSIONS } from '@/lib/permissions'
import { useAdminLanguage } from '@/contexts/AdminLanguageContext'

type ManagedUser = {
  id: string
  name: string
  email: string
  isActive: boolean
  isSuperAdmin: boolean
  permissions: string[]
}

const KNOWN_NAME_TRANSLATIONS: Record<string, string> = {
  'المدير الرئيسي': 'Super Admin',
}

function translateKnownName(name: string, isEn: boolean) {
  return isEn && KNOWN_NAME_TRANSLATIONS[name] ? KNOWN_NAME_TRANSLATIONS[name] : name
}

export default function UsersPage() {
  const { hasPermission } = useAuth()
  const { t, locale } = useAdminLanguage()
  const isAdminEn = locale === 'en'
  const [users, setUsers] = useState<ManagedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null)
  const [showForm, setShowForm] = useState(false)

  async function loadUsers() {
    setLoading(true)
    try {
      const res = await fetch('/api/users')
      const data = await res.json()
      if (res.ok) setUsers(data.users)
      else toast.error(data.error || t('admin_error'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  async function handleDelete(id: string) {
    if (!confirm(t('users_delete_confirm'))) return
    const res = await fetch(`/api/users/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (res.ok) {
      toast.success(t('users_delete_success'))
      loadUsers()
    } else {
      toast.error(data.error || t('admin_error'))
    }
  }

  if (!hasPermission('users.manage')) {
    return <p className="p-6 text-muted-foreground">{t('users_no_permission')}</p>
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('users_title')}</h1>
        <Button
          onClick={() => {
            setEditingUser(null)
            setShowForm(true)
          }}
          className="gradient-primary text-white"
        >
          <Plus className="w-4 h-4 ml-2" /> {t('users_new')}
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">{t('admin_loading')}</p>
      ) : (
        <div className="grid gap-3">
          {users.map((u) => (
            <div
              key={u.id}
              className="flex items-center justify-between p-4 rounded-xl border bg-white"
            >
              <div>
                <div className="flex items-center gap-2 font-medium">
                  {translateKnownName(u.name, isAdminEn)}
                  {u.isSuperAdmin && <ShieldCheck className="w-4 h-4 text-primary" />}
                  {!u.isActive && (
                    <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                      {t('users_disabled')}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{u.email}</p>
                {!u.isSuperAdmin && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {u.permissions.map((key) => (
                      <span
                        key={key}
                        className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground"
                      >
                       {(() => {
                          const perm = AVAILABLE_PERMISSIONS.find((p) => p.key === key)
                          return perm ? t(perm.labelKey) : key
                        })()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => {
                    setEditingUser(u)
                    setShowForm(true)
                  }}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                {!u.isSuperAdmin && (
                  <Button size="icon" variant="destructive" onClick={() => handleDelete(u.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <UserForm
          user={editingUser}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false)
            loadUsers()
          }}
        />
      )}
    </div>
  )
}