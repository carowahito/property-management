import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { getSupabaseAdmin } from '@/lib/supabase'

const BUCKET = 'landlord-documents'

async function ensureBucket() {
  const supabase = getSupabaseAdmin()
  const { data: buckets } = await supabase.storage.listBuckets()
  if (!buckets?.find(b => b.name === BUCKET)) {
    await supabase.storage.createBucket(BUCKET, { public: false })
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const docs = await prisma.landlordDocument.findMany({
    where: { landlordId: id },
    orderBy: { uploadedAt: 'desc' },
  })

  // Generate fresh signed URLs (1h expiry)
  const supabase = getSupabaseAdmin()
  const withUrls = await Promise.all(docs.map(async doc => {
    const { data } = await supabase.storage.from(BUCKET).createSignedUrl(doc.storagePath, 3600)
    return { ...doc, url: data?.signedUrl ?? doc.url }
  }))

  return NextResponse.json({ documents: withUrls })
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const landlord = await prisma.landlord.findUnique({ where: { id } })
  if (!landlord) return NextResponse.json({ error: 'Landlord not found' }, { status: 404 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const maxMb = 10
  if (file.size > maxMb * 1024 * 1024) {
    return NextResponse.json({ error: `File must be under ${maxMb}MB` }, { status: 400 })
  }

  try {
    await ensureBucket()

    const ext = file.name.split('.').pop() ?? 'bin'
    const storagePath = `${id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const supabase = getSupabaseAdmin()
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, buffer, { contentType: file.type || 'application/octet-stream', upsert: false })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
    }

    const { data: signedData } = await supabase.storage.from(BUCKET).createSignedUrl(storagePath, 3600)

    const doc = await prisma.landlordDocument.create({
      data: {
        landlordId: id,
        name: file.name,
        fileType: file.type || ext,
        fileSize: file.size,
        storagePath,
        url: signedData?.signedUrl ?? '',
      },
    })

    return NextResponse.json(doc, { status: 201 })
  } catch (err: any) {
    console.error('Document upload error:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
