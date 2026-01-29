/**
 * Affiliate Link Redirect Handler
 * 
 * /go/[shortCode] - Tracks click and redirects to affiliate URL
 */

import { NextRequest, NextResponse } from 'next/server';
import { getLinkByShortCode } from '@/lib/affiliate/link-generator';
import { trackClick, generateSessionId, detectBot } from '@/lib/affiliate/tracking';
import { checkClickFraud, isIPBlocked } from '@/lib/affiliate/fraud-detection';
import { cookies } from 'next/headers';

// Cookie name for tracking session
const SESSION_COOKIE = 'bh_affiliate_session';
const SESSION_COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shortCode: string }> }
) {
  const { shortCode } = await params;
  
  try {
    // Get the link
    const link = await getLinkByShortCode(shortCode);
    
    if (!link) {
      // Redirect to homepage with error
      return NextResponse.redirect(
        new URL('/?error=invalid_link', request.url)
      );
    }
    
    // Check if link is active
    if (link.status !== 'active') {
      return NextResponse.redirect(
        new URL('/?error=expired_link', request.url)
      );
    }
    
    // Check if link has expired
    if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
      return NextResponse.redirect(
        new URL('/?error=expired_link', request.url)
      );
    }
    
    // Check if partner is active
    if (link.partner.status !== 'active') {
      return NextResponse.redirect(
        new URL('/?error=partner_inactive', request.url)
      );
    }
    
    // Get request info
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] 
      || request.headers.get('x-real-ip') 
      || 'unknown';
    const userAgent = request.headers.get('user-agent') || '';
    const referrer = request.headers.get('referer') || '';
    
    // Check for blocked IP
    const isBlocked = await isIPBlocked(ipAddress);
    if (isBlocked) {
      return NextResponse.redirect(link.trackingUrl || link.originalUrl);
    }
    
    // Check for bot traffic
    const botCheck = detectBot(userAgent);
    
    // Fraud check (don't block bots entirely, just flag)
    const fraudCheck = await checkClickFraud(
      ipAddress,
      '', // Session ID will be set below
      link.id,
      userAgent
    );
    
    // Get or create session ID
    const cookieStore = await cookies();
    let sessionId = cookieStore.get(SESSION_COOKIE)?.value;
    
    if (!sessionId) {
      sessionId = generateSessionId();
    }
    
    // Track the click (async, don't block redirect)
    // Only track if not a bot and fraud score is acceptable
    if (!botCheck.isBot && fraudCheck.isAllowed) {
      trackClick({
        linkId: link.id,
        partnerId: link.partnerId,
        productId: link.productId || undefined,
        sessionId,
        ipAddress,
        userAgent,
        referrer,
        // Note: Country code would need a geo-IP service
        countryCode: undefined,
      }).catch((err) => {
        console.error('Failed to track click:', err);
      });
    } else if (botCheck.isBot) {
      // Still track bot clicks for analytics, but mark them
      trackClick({
        linkId: link.id,
        partnerId: link.partnerId,
        productId: link.productId || undefined,
        sessionId,
        ipAddress,
        userAgent,
        referrer,
      }).catch(() => {});
    }
    
    // Create redirect response with 302 (to preserve affiliate tracking)
    const response = NextResponse.redirect(link.trackingUrl || link.originalUrl, 302);
    
    // Set/refresh session cookie
    response.cookies.set(SESSION_COOKIE, sessionId, {
      maxAge: SESSION_COOKIE_MAX_AGE,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
    
    // Set affiliate cookie for attribution
    response.cookies.set(`bh_partner_${link.partnerId}`, sessionId, {
      maxAge: (link.partner.cookieDuration || 30) * 24 * 60 * 60,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
    
    return response;
    
  } catch (error) {
    console.error('Affiliate redirect error:', error);
    // On error, redirect to homepage
    return NextResponse.redirect(new URL('/', request.url));
  }
}
