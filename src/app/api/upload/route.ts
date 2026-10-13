
import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import path from 'path'
import { getCurrentUser, hasPermission } from '@/lib/auth'

export const runtime = 'nodejs'

const MAX_IMAGE_SIZE = 5 * 1024 * 1024
const MAX_VIDEO_SIZE = 50 * 1024 * 1024

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]

const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/ogg',
]

const ALLOWED_TYPES = [
  ...ALLOWED_IMAGE_TYPES,
  ...ALLOWED_VIDEO_TYPES,
]

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()

   if (!user || !hasPermission(user, 'settings.manage')) {
  return NextResponse.json(
    { error: 'غير مصرح لك برفع الملفات' },
    { status: 403 }
  )
}

    const formData = await req.formData()
    const file = formData.get('file')

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: 'لم يتم اختيار ملف' },
        { status: 400 }
      )
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'نوع الملف غير مدعوم' },
        { status: 400 }
      )
    }

    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type)
    const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE

    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error: isVideo
            ? 'حجم الفيديو كبير جدًا، الحد الأقصى 50 ميجابايت'
            : 'حجم الصورة كبير جدًا، الحد الأقصى 5 ميجابايت',
        },
        { status: 400 }
      )
    }

    const ext = path.extname(file.name).toLowerCase()
    const safeExt = /^\.[a-z0-9]{1,10}$/.test(ext)
      ? ext
      : isVideo
        ? '.mp4'
        : '.jpg'

    const subDir = isVideo ? 'videos' : 'images'
    const fileName = `${Date.now()}-${crypto.randomUUID()}${safeExt}`

    const blob = await put(
      `${subDir}/${fileName}`,
      file,
      {
        access: 'public',
        addRandomSuffix: false,
        contentType: file.type,
      }
    )

    return NextResponse.json({ url: blob.url })
  } catch (error) {
    console.error('Error uploading file:', error)

    return NextResponse.json(
      { error: 'حدث خطأ أثناء رفع الملف' },
      { status: 500 }
    )
  }
}
