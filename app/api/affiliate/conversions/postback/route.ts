/**
 * Affiliate Conversion Postback Handler
 * 
 * POST /api/affiliate/conversions/postback - Receive conversion notifications from partners
 * 
 * This endpoint is called by affiliate networks/partners when a conversion occurs.
 * It should be publicly accessible but protected by signature verification.
 */

import { NextRequest, NextResponse } from 'next/server';
import { processPostback } from '@/lib/affiliate/commission';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

// Verify HMAC signature from partner
function verifySignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-signature');
    const partnerId = request.headers.get('x-partner-id');
    
    // Check if partner ID is provided
    if (!partnerId) {
      // Try to get partner from query params (some networks use this)
      const searchParams = request.nextUrl.searchParams;
      const altPartnerId = searchParams.get('partner_id');
      
      if (!altPartnerId) {
        return NextResponse.json(
          { error: 'Partner ID required' },
          { status: 400 }
        );
      }
    }

    // Get partner and verify API key if signature provided
    const finalPartnerId = partnerId || request.nextUrl.searchParams.get('partner_id');
    
    if (finalPartnerId) {
      const partner = await prisma.affiliatePartner.findUnique({
        where: { id: finalPartnerId },
      });

      if (!partner) {
        return NextResponse.json(
          { error: 'Invalid partner' },
          { status: 401 }
        );
      }

      // Verify signature if partner has API key
      if (partner.apiKey && signature) {
        const isValid = verifySignature(body, signature, partner.apiKey);
        if (!isValid) {
          return NextResponse.json(
            { error: 'Invalid signature' },
            { status: 401 }
          );
        }
      }
    }

    // Parse the payload
    let payload;
    try {
      payload = JSON.parse(body);
    } catch {
      // Try URL-encoded format
      const formData = new URLSearchParams(body);
      payload = Object.fromEntries(formData);
    }

    // Extract conversion data (handle various formats from different networks)
    const orderId = payload.order_id || payload.orderId || payload.transaction_id || '';
    const transactionId = payload.transaction_id || payload.transactionId || payload.txn_id || undefined;
    const conversionData = {
      orderId,
      transactionId,
      amount: parseFloat(payload.amount || payload.sale_amount || payload.total || '0'),
      clickId: payload.click_id || payload.clickId || payload.subid || payload.sub_id,
      subId: payload.sub_id || payload.subId || payload.subid,
      partnerId: finalPartnerId || payload.partner_id || payload.partnerId,
      productId: payload.product_id || payload.productId,
      currency: payload.currency || 'USD',
    };

    // Validate required fields
    if (!conversionData.orderId) {
      return NextResponse.json(
        { error: 'Order ID required' },
        { status: 400 }
      );
    }

    if (conversionData.amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Process the postback
    const result = await processPostback(conversionData);

    // Log the API call
    if (finalPartnerId) {
      await prisma.partnerApiLog.create({
        data: {
          partnerId: finalPartnerId,
          apiEndpoint: '/api/affiliate/conversions/postback',
          requestMethod: 'POST',
          requestPayload: body.slice(0, 5000), // Limit size
          responseStatus: result.success ? 200 : 400,
          responseBody: JSON.stringify(result),
          responseTimeMs: 0, // Would need timing to calculate
        },
      });
    }

    if (result.success) {
      return NextResponse.json({
        status: 'success',
        conversionId: result.conversionId,
        message: 'Conversion recorded successfully',
      });
    } else {
      return NextResponse.json(
        {
          status: 'error',
          error: result.error,
          conversionId: result.conversionId,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Postback error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Also support GET for networks that use redirect-based postbacks
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const orderId = searchParams.get('order_id') || searchParams.get('transaction_id') || '';
    const transactionId = searchParams.get('transaction_id') || searchParams.get('txn_id') || undefined;
    const conversionData = {
      orderId,
      transactionId,
      amount: parseFloat(searchParams.get('amount') || searchParams.get('sale_amount') || '0'),
      clickId: searchParams.get('click_id') ?? searchParams.get('subid') ?? undefined,
      subId: searchParams.get('sub_id') ?? searchParams.get('subid') ?? undefined,
      partnerId: searchParams.get('partner_id') ?? undefined,
      productId: searchParams.get('product_id') ?? undefined,
      currency: searchParams.get('currency') || 'USD',
    };

    if (!conversionData.orderId) {
      return NextResponse.json(
        { error: 'Order ID required' },
        { status: 400 }
      );
    }

    if (conversionData.amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    const result = await processPostback(conversionData);

    if (result.success) {
      // Return 1x1 pixel for tracking pixel implementations
      const pixel = Buffer.from(
        'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
        'base64'
      );
      
      return new NextResponse(pixel, {
        headers: {
          'Content-Type': 'image/gif',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });
    } else {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
  } catch (error) {
    console.error('Postback GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
