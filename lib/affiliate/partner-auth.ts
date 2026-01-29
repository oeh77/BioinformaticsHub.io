/**
 * Partner Portal Middleware - Session Verification
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

const PARTNER_SESSION_COOKIE = 'bh_partner_session';

export interface PartnerSession {
  partnerId: string;
  companyName: string;
}

/**
 * Verify partner session and return partner info
 */
export async function verifyPartnerSession(request: NextRequest): Promise<PartnerSession | null> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(PARTNER_SESSION_COOKIE)?.value;

    if (!sessionToken) {
      return null;
    }

    // Get session from database
    const sessionKey = `partner_session_${sessionToken}`;
    const sessionData = await prisma.settings.findUnique({
      where: { key: sessionKey },
    });

    if (!sessionData) {
      return null;
    }

    const session = JSON.parse(sessionData.value);

    // Check expiration
    if (new Date(session.expiresAt) < new Date()) {
      // Clean up expired session
      await prisma.settings.delete({ where: { key: sessionKey } }).catch(() => {});
      return null;
    }

    // Get partner info
    const partner = await prisma.affiliatePartner.findUnique({
      where: { id: session.partnerId },
      select: { id: true, companyName: true, status: true },
    });

    if (!partner || partner.status !== 'active') {
      return null;
    }

    return {
      partnerId: partner.id,
      companyName: partner.companyName,
    };
  } catch (error) {
    console.error('Session verification error:', error);
    return null;
  }
}

/**
 * Create a response with unauthorized error
 */
export function unauthorizedResponse(): NextResponse {
  return NextResponse.json(
    { error: 'Unauthorized' },
    { status: 401 }
  );
}
