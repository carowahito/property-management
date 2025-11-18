import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { createMessageSchema } from '@/lib/validations/communication'
import { sendEmail } from '@/lib/services/email'
import { sendSMS } from '@/lib/services/sms'
import { sendWhatsApp } from '@/lib/services/whatsapp'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type')
    const category = searchParams.get('category')
    const stakeholderType = searchParams.get('stakeholderType')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: any = {}

    if (type && type !== 'all') where.type = type
    if (category && category !== 'all') where.category = category
    if (stakeholderType && stakeholderType !== 'all')
      where.stakeholderType = stakeholderType

    if (search) {
      where.OR = [
        { subject: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where,
        include: {
          sentBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          property: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { sentAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.message.count({ where }),
    ])

    return NextResponse.json({
      messages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createMessageSchema.parse(body)

    const message = await prisma.message.create({
      data: {
        ...validatedData,
        sentById: session.user.id,
        direction: 'SENT',
        status: 'SENT',
      },
      include: {
        sentBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    // Send message via appropriate channel
    try {
      // Get stakeholder details for contact info
      let recipientEmail = ''
      let recipientPhone = ''

      const stakeholder = await (async () => {
        switch (validatedData.stakeholderType) {
          case 'TENANT':
            return await prisma.tenant.findUnique({ where: { id: validatedData.stakeholderId } })
          case 'LANDLORD':
            return await prisma.landlord.findUnique({ where: { id: validatedData.stakeholderId } })
          case 'VENDOR':
            return await prisma.vendor.findUnique({ where: { id: validatedData.stakeholderId } })
          case 'LEAD':
            return await prisma.lead.findUnique({ where: { id: validatedData.stakeholderId } })
          case 'ENQUIRY':
            return await prisma.enquiry.findUnique({ where: { id: validatedData.stakeholderId } })
          default:
            return null
        }
      })()

      if (stakeholder) {
        recipientEmail = stakeholder.email
        recipientPhone = stakeholder.phone
      }

      // Send via appropriate channel
      if (message.type === 'EMAIL' && recipientEmail) {
        await sendEmail({
          to: recipientEmail,
          subject: validatedData.subject,
          html: validatedData.content,
        })
      } else if (message.type === 'SMS' && recipientPhone) {
        await sendSMS({
          to: recipientPhone,
          message: validatedData.content,
        })
      } else if (message.type === 'WHATSAPP' && recipientPhone) {
        await sendWhatsApp({
          to: recipientPhone,
          message: validatedData.content,
          mediaUrl: validatedData.attachments?.[0], // Send first attachment if available
        })
      }
    } catch (sendError) {
      console.error('Error sending message:', sendError)
      // Update message status to FAILED
      await prisma.message.update({
        where: { id: message.id },
        data: { status: 'FAILED' },
      })
    }

    return NextResponse.json(message, { status: 201 })
  } catch (error: any) {
    console.error('Error creating message:', error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
