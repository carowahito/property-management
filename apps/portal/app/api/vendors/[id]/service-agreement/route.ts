import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'

const BUCKET = 'vendor-documents'
const MAX_BYTES = 10 * 1024 * 1024

function tryGetSupabaseAdmin() {
  try {
    const { getSupabaseAdmin } = require('@/lib/supabase')
    return getSupabaseAdmin()
  } catch {
    return null
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const vendor = await prisma.vendor.findUnique({ where: { id } })
  if (!vendor) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  if (file.size > MAX_BYTES) return NextResponse.json({ error: 'File must be under 10 MB' }, { status: 400 })

  const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: 'Only PDF, image, and Word document files are allowed' }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const supabase = tryGetSupabaseAdmin()

  let url = ''

  try {
    if (supabase) {
      const { data: buckets } = await supabase.storage.listBuckets()
      if (!buckets?.find((b: any) => b.name === BUCKET)) {
        await supabase.storage.createBucket(BUCKET, { public: false })
      }

      const ext = file.name.split('.').pop() || 'pdf'
      const storagePath = `${id}/service-agreement-${Date.now()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, buffer, { contentType: file.type, upsert: true })

      if (uploadError) {
        return NextResponse.json({ error: `Upload failed: ${uploadError.message}` }, { status: 500 })
      }

      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(storagePath)
      url = urlData.publicUrl
    } else {
      // Local dev fallback: store as data URL
      url = `data:${file.type};base64,${buffer.toString('base64')}`
    }

    const updated = await prisma.vendor.update({
      where: { id },
      data: {
        serviceAgreementUrl: url,
        serviceAgreementName: file.name,
        serviceAgreementDate: new Date(),
      },
    })

    return NextResponse.json({
      url,
      name: file.name,
      date: updated.serviceAgreementDate,
    }, { status: 201 })
  } catch (err: any) {
    console.error('Service agreement upload error:', err)
    return NextResponse.json({ error: err.message ?? 'Upload failed' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  await prisma.vendor.update({
    where: { id },
    data: { serviceAgreementUrl: null, serviceAgreementName: null, serviceAgreementDate: null },
  })

  return NextResponse.json({ message: 'Service agreement removed' })
}
