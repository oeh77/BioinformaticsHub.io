/**
 * Conversion Actions API
 * 
 * PUT /api/admin/affiliate/conversions/[id] - Update conversion status (approve/reject)
 * GET /api/admin/affiliate/conversions/[id] - Get conversion details
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { approveConversion, rejectConversion, reverseConversion } from '@/lib/affiliate/commission';

const updateConversionSchema = z.object({
  action: z.enum(['approve', 'reject', 'reverse']),
  notes: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const conversion = await prisma.affiliateConversion.findUnique({
      where: { id },
      include: {
        partner: true,
        product: true,
        payout: true,
      },
    });

    if (!conversion) {
      return NextResponse.json({ error: 'Conversion not found' }, { status: 404 });
    }

    // Get associated click info if available
    let clickInfo = null;
    if (conversion.clickId) {
      clickInfo = await prisma.affiliateClick.findUnique({
        where: { id: conversion.clickId },
        select: {
          id: true,
          sessionId: true,
          ipAddress: true,
          userAgent: true,
          referrer: true,
          deviceType: true,
          browser: true,
          os: true,
          clickedAt: true,
          isBot: true,
        },
      });
    }

    return NextResponse.json({
      ...conversion,
      clickInfo,
    });
  } catch (error) {
    console.error('Failed to fetch conversion:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversion' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = updateConversionSchema.parse(body);

    // Check if conversion exists
    const conversion = await prisma.affiliateConversion.findUnique({
      where: { id },
    });

    if (!conversion) {
      return NextResponse.json({ error: 'Conversion not found' }, { status: 404 });
    }

    // Perform the action
    switch (validatedData.action) {
      case 'approve':
        await approveConversion(id, validatedData.notes);
        break;
      case 'reject':
        await rejectConversion(id, validatedData.notes);
        break;
      case 'reverse':
        await reverseConversion(id, validatedData.notes);
        break;
    }

    // Fetch updated conversion
    const updatedConversion = await prisma.affiliateConversion.findUnique({
      where: { id },
      include: {
        partner: {
          select: { id: true, companyName: true },
        },
        product: {
          select: { id: true, productName: true },
        },
      },
    });

    return NextResponse.json(updatedConversion);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Failed to update conversion:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update conversion' },
      { status: 500 }
    );
  }
}
