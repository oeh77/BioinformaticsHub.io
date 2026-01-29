/**
 * Partner Portal API - Authentication
 * 
 * POST /api/affiliate/partner/auth - Partner login
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { cookies } from 'next/headers';

const PARTNER_SESSION_COOKIE = 'bh_partner_session';
const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7 days

// Generate a secure session token
function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Hash the API key for comparison
function hashApiKey(apiKey: string): string {
  return crypto.createHash('sha256').update(apiKey).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { partnerId, apiKey } = body;

    if (!partnerId || !apiKey) {
      return NextResponse.json(
        { error: 'Partner ID and API key are required' },
        { status: 400 }
      );
    }

    // Find the partner
    const partner = await prisma.affiliatePartner.findUnique({
      where: { id: partnerId },
    });

    if (!partner) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check partner status
    if (partner.status !== 'active') {
      return NextResponse.json(
        { error: 'Partner account is not active' },
        { status: 403 }
      );
    }

    // Verify API key
    if (!partner.apiKey || partner.apiKey !== apiKey) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate session token
    const sessionToken = generateSessionToken();
    const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000);

    // Store session (using Settings for simplicity - could use a dedicated table)
    const sessionKey = `partner_session_${sessionToken}`;
    await prisma.settings.upsert({
      where: { key: sessionKey },
      update: { value: JSON.stringify({ partnerId: partner.id, expiresAt }) },
      create: { key: sessionKey, value: JSON.stringify({ partnerId: partner.id, expiresAt }) },
    });

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set(PARTNER_SESSION_COOKIE, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_MAX_AGE,
      path: '/',
    });

    return NextResponse.json({
      success: true,
      partner: {
        id: partner.id,
        companyName: partner.companyName,
        contactEmail: partner.contactEmail,
      },
    });
  } catch (error) {
    console.error('Partner auth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

// Logout
export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(PARTNER_SESSION_COOKIE)?.value;

    if (sessionToken) {
      // Remove session from database
      const sessionKey = `partner_session_${sessionToken}`;
      await prisma.settings.delete({
        where: { key: sessionKey },
      }).catch(() => {});

      // Clear cookie
      cookieStore.delete(PARTNER_SESSION_COOKIE);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Partner logout error:', error);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}
