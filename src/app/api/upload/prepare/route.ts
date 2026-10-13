import { NextRequest, NextResponse } from 'next/server'
import { handleUpload } from '@vercel/blob/client'
import { getCurrentUser, hasPermission } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()

 if (!user || !hasPermission(user, 'settings.manage')) {
  return NextResponse.json(
    { error: 'غير مصرح لك برفع الملفات' },
    { status: 403 }
  )
}

  try {
    const body = await request.json()

    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        const currentUser = await getCurrentUser()

       if (
          !currentUser ||
          !hasPermission(currentUser, 'settings.manage')
        ) {
          throw new Error('غير مصرح لك برفع الملفات')
        }

        return {
          allowedContentTypes: [
            'image/jpeg',
            'image/png',
            'image/webp',
            'image/gif',
            'video/mp4',
            'video/webm',
            'video/ogg',
          ],
          maximumSizeInBytes: 50 * 1024 * 1024,
          tokenPayload: JSON.stringify({ userId: currentUser.id }),
        }
      },
      onUploadCompleted: async () => {},
    })

    return NextResponse.json(jsonResponse)
  } catch (error) {
    console.error('Blob upload preparation failed:', error)
    return NextResponse.json(
      { error: 'تعذر تجهيز رفع الملف' },
      { status: 400 }
    )
  }
}
