import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const lease = await prisma.lease.findUnique({ where: { id } })
  if (!lease) {
    return NextResponse.json({ error: 'Lease not found' }, { status: 404 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const type = formData.get('type') as string // 'document' | 'landlordSignature' | 'tenantSignature'

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: 'Only PDF and image files are allowed' }, { status: 400 })
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'File must be under 10MB' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()
  const ext = file.name.split('.').pop() || 'pdf'
  const path = `${id}/${type}-${Date.now()}.${ext}`

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const { error: uploadError } = await supabase.storage
    .from('lease-documents')
    .upload(path, buffer, { contentType: file.type, upsert: true })

  if (uploadError) {
    return NextResponse.json({ error: `Upload failed: ${uploadError.message}` }, { status: 500 })
  }

  const { data: urlData } = supabase.storage
    .from('lease-documents')
    .getPublicUrl(path)

  const publicUrl = urlData.publicUrl

  // Update the lease record
  const updateData: any = {}
  if (type === 'document') {
    updateData.documentUrl = publicUrl
  } else if (type === 'landlordSignature') {
    updateData.landlordSignature = publicUrl
    updateData.landlordSignedAt = new Date()
  } else if (type === 'tenantSignature') {
    updateData.tenantSignature = publicUrl
    updateData.tenantSignedAt = new Date()
  }

  const updated = await prisma.lease.update({
    where: { id },
    data: updateData,
  })

  return NextResponse.json({ url: publicUrl, type, leaseId: id })
}
