import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'

const BUCKET = 'tenant-documents'
const MAX_BYTES = 10 * 1024 * 1024 // 10 MB

function tryGetSupabaseAdmin() {
  try {
    const { getSupabaseAdmin } = require('@/lib/supabase')
    return getSupabaseAdmin()
  } catch {
    return null
  }
}

async function ensureBucket(supabase: any) {
  const { data: buckets } = await supabase.storage.listBuckets()
  if (!buckets?.find((b: any) => b.name === BUCKET)) {
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

  const docs = await (prisma as any).tenantDocument.findMany({
    where: { tenantId: id },
    orderBy: { uploadedAt: 'desc' },
    select: { id: true, name: true, fileType: true, fileSize: true, storagePath: true, url: true, content: true, uploadedAt: true },
  })

  const supabase = tryGetSupabaseAdmin()

  const withUrls = await Promise.all(docs.map(async (doc: any) => {
    if (doc.content) {
      return { ...doc, url: `data:${doc.fileType};base64,${doc.content}`, content: undefined }
    }
    if (supabase && doc.storagePath) {
      const { data } = await supabase.storage.from(BUCKET).createSignedUrl(doc.storagePath, 3600)
      return { ...doc, url: data?.signedUrl ?? doc.url, content: undefined }
    }
    return { ...doc, content: undefined }
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

  const tenant = await prisma.tenant.findUnique({ where: { id } })
  if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  if (file.size > MAX_BYTES) return NextResponse.json({ error: 'File must be under 10 MB' }, { status: 400 })

  const buffer = Buffer.from(await file.arrayBuffer())
  const supabase = tryGetSupabaseAdmin()

  try {
    if (supabase) {
      await ensureBucket(supabase)
      const storagePath = `${id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, buffer, { contentType: file.type || 'application/octet-stream', upsert: false })

      if (uploadError) {
        console.error('Storage upload error:', uploadError)
        return NextResponse.json({ error: 'Failed to upload to storage' }, { status: 500 })
      }

      const { data: signedData } = await supabase.storage.from(BUCKET).createSignedUrl(storagePath, 3600)

      const doc = await (prisma as any).tenantDocument.create({
        data: { tenantId: id, name: file.name, fileType: file.type, fileSize: file.size, storagePath, url: signedData?.signedUrl ?? '' },
      })
      return NextResponse.json(doc, { status: 201 })

    } else {
      const base64 = buffer.toString('base64')
      const doc = await (prisma as any).tenantDocument.create({
        data: { tenantId: id, name: file.name, fileType: file.type, fileSize: file.size, content: base64 },
      })
      return NextResponse.json({ ...doc, url: `data:${file.type};base64,${base64}` }, { status: 201 })
    }
  } catch (err: any) {
    console.error('Document upload error:', err)
    return NextResponse.json({ error: err.message ?? 'Upload failed' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const docId = searchParams.get('docId')
  if (!docId) return NextResponse.json({ error: 'docId required' }, { status: 400 })

  const doc = await (prisma as any).tenantDocument.findUnique({ where: { id: docId } })
  if (!doc) return NextResponse.json({ error: 'Document not found' }, { status: 404 })

  const supabase = tryGetSupabaseAdmin()
  if (supabase && doc.storagePath) {
    await supabase.storage.from(BUCKET).remove([doc.storagePath])
  }

  await (prisma as any).tenantDocument.delete({ where: { id: docId } })
  return NextResponse.json({ success: true })
}
