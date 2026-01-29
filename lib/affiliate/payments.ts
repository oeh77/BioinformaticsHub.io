/**
 * Affiliate Payment Integration
 * 
 * Supports multiple payment providers:
 * - Stripe Connect (for ACH/bank transfers)
 * - PayPal Payouts (for PayPal transfers)
 * - Manual (for checks, wire transfers)
 */

import { prisma } from '@/lib/prisma';

// Payment provider types
export type PaymentProvider = 'stripe' | 'paypal' | 'manual';

export interface PaymentResult {
  success: boolean;
  provider: PaymentProvider;
  transactionId?: string;
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface PayoutDetails {
  payoutId: string;
  partnerId: string;
  amount: number;
  currency: string;
  partnerEmail: string;
  partnerPaymentDetails?: {
    stripeAccountId?: string;
    paypalEmail?: string;
    bankAccount?: {
      bankName: string;
      accountNumber: string;
      routingNumber: string;
    };
  };
}

// ============================================================================
// STRIPE INTEGRATION
// ============================================================================

/**
 * Initialize Stripe client
 */
function getStripeClient() {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  
  // Dynamic import to avoid issues if Stripe is not installed
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Stripe = require('stripe');
  return new Stripe(stripeKey, { apiVersion: '2023-10-16' });
}

/**
 * Create a Stripe Connect account for a partner
 */
export async function createStripeConnectAccount(
  partnerId: string,
  email: string,
  businessName: string
): Promise<{ accountId: string; onboardingUrl: string }> {
  try {
    const stripe = getStripeClient();

    // Create a Connected Account
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'US',
      email,
      business_type: 'company',
      company: {
        name: businessName,
      },
      capabilities: {
        transfers: { requested: true },
      },
      metadata: {
        partnerId,
      },
    });

    // Create an account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/partner/settings?stripe=refresh`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/partner/settings?stripe=success`,
      type: 'account_onboarding',
    });

    // Store the Stripe account ID
    await prisma.affiliatePartner.update({
      where: { id: partnerId },
      data: {
        paymentDetails: JSON.stringify({
          stripeAccountId: account.id,
          stripeOnboarded: false,
        }),
      },
    });

    return {
      accountId: account.id,
      onboardingUrl: accountLink.url,
    };
  } catch (error) {
    console.error('[Stripe] Failed to create Connect account:', error);
    throw error;
  }
}

/**
 * Process a payout via Stripe Connect
 */
export async function processStripePayment(details: PayoutDetails): Promise<PaymentResult> {
  try {
    const stripe = getStripeClient();

    // Get Stripe account ID from partner payment details
    const stripeAccountId = details.partnerPaymentDetails?.stripeAccountId;
    if (!stripeAccountId) {
      return {
        success: false,
        provider: 'stripe',
        error: 'Partner has no Stripe Connect account',
      };
    }

    // Create a transfer to the connected account
    const transfer = await stripe.transfers.create({
      amount: Math.round(details.amount * 100), // Convert to cents
      currency: details.currency.toLowerCase(),
      destination: stripeAccountId,
      metadata: {
        payoutId: details.payoutId,
        partnerId: details.partnerId,
      },
    });

    return {
      success: true,
      provider: 'stripe',
      transactionId: transfer.id,
      metadata: {
        amount: transfer.amount,
        currency: transfer.currency,
        created: transfer.created,
      },
    };
  } catch (error) {
    console.error('[Stripe] Payment failed:', error);
    return {
      success: false,
      provider: 'stripe',
      error: error instanceof Error ? error.message : 'Stripe payment failed',
    };
  }
}

/**
 * Check Stripe Connect account status
 */
export async function checkStripeAccountStatus(accountId: string): Promise<{
  isActive: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
}> {
  try {
    const stripe = getStripeClient();
    const account = await stripe.accounts.retrieve(accountId);

    return {
      isActive: account.details_submitted && account.payouts_enabled,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      detailsSubmitted: account.details_submitted,
    };
  } catch (error) {
    console.error('[Stripe] Failed to check account status:', error);
    return {
      isActive: false,
      chargesEnabled: false,
      payoutsEnabled: false,
      detailsSubmitted: false,
    };
  }
}

// ============================================================================
// PAYPAL INTEGRATION
// ============================================================================

/**
 * Get PayPal access token
 */
async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const baseUrl = process.env.PAYPAL_MODE === 'live'
    ? 'https://api.paypal.com'
    : 'https://api.sandbox.paypal.com';

  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials not configured');
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  
  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    throw new Error('Failed to get PayPal access token');
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * Process a payout via PayPal Payouts API
 */
export async function processPayPalPayment(details: PayoutDetails): Promise<PaymentResult> {
  try {
    const paypalEmail = details.partnerPaymentDetails?.paypalEmail || details.partnerEmail;
    if (!paypalEmail) {
      return {
        success: false,
        provider: 'paypal',
        error: 'Partner has no PayPal email configured',
      };
    }

    const accessToken = await getPayPalAccessToken();
    const baseUrl = process.env.PAYPAL_MODE === 'live'
      ? 'https://api.paypal.com'
      : 'https://api.sandbox.paypal.com';

    // Create a payout batch
    const senderBatchId = `payout_${details.payoutId}_${Date.now()}`;
    
    const payoutData = {
      sender_batch_header: {
        sender_batch_id: senderBatchId,
        email_subject: 'You have a payout from BioinformaticsHub',
        email_message: 'Thank you for being an affiliate partner!',
      },
      items: [
        {
          recipient_type: 'EMAIL',
          amount: {
            value: details.amount.toFixed(2),
            currency: details.currency,
          },
          receiver: paypalEmail,
          note: `Affiliate payout for payout ID: ${details.payoutId}`,
          sender_item_id: details.payoutId,
        },
      ],
    };

    const response = await fetch(`${baseUrl}/v1/payments/payouts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payoutData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[PayPal] Payout failed:', errorData);
      return {
        success: false,
        provider: 'paypal',
        error: errorData.message || 'PayPal payout failed',
      };
    }

    const data = await response.json();

    return {
      success: true,
      provider: 'paypal',
      transactionId: data.batch_header.payout_batch_id,
      metadata: {
        senderBatchId,
        batchStatus: data.batch_header.batch_status,
      },
    };
  } catch (error) {
    console.error('[PayPal] Payment failed:', error);
    return {
      success: false,
      provider: 'paypal',
      error: error instanceof Error ? error.message : 'PayPal payment failed',
    };
  }
}

/**
 * Check PayPal payout status
 */
export async function checkPayPalPayoutStatus(batchId: string): Promise<{
  status: string;
  items: Array<{ status: string; transactionId?: string; error?: string }>;
}> {
  try {
    const accessToken = await getPayPalAccessToken();
    const baseUrl = process.env.PAYPAL_MODE === 'live'
      ? 'https://api.paypal.com'
      : 'https://api.sandbox.paypal.com';

    const response = await fetch(`${baseUrl}/v1/payments/payouts/${batchId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to check PayPal payout status');
    }

    const data = await response.json();

    return {
      status: data.batch_header.batch_status,
      items: data.items?.map((item: {
        transaction_status: string;
        payout_item_id?: string;
        errors?: { message?: string };
      }) => ({
        status: item.transaction_status,
        transactionId: item.payout_item_id,
        error: item.errors?.message,
      })) || [],
    };
  } catch (error) {
    console.error('[PayPal] Failed to check status:', error);
    return { status: 'UNKNOWN', items: [] };
  }
}

// ============================================================================
// UNIFIED PAYMENT PROCESSOR
// ============================================================================

/**
 * Process a payout using the partner's preferred payment method
 */
export async function processPayment(payoutId: string): Promise<PaymentResult> {
  try {
    // Get payout details
    const payout = await prisma.affiliatePayout.findUnique({
      where: { id: payoutId },
      include: {
        partner: {
          select: {
            id: true,
            contactEmail: true,
            paymentDetails: true,
          },
        },
      },
    });

    if (!payout) {
      return { success: false, provider: 'manual', error: 'Payout not found' };
    }

    if (payout.payoutStatus === 'paid') {
      return { success: false, provider: 'manual', error: 'Payout already completed' };
    }

    if (!payout.partner) {
      return { success: false, provider: 'manual', error: 'Partner not found for payout' };
    }

    // Parse payment details
    let paymentDetails: PayoutDetails['partnerPaymentDetails'] = undefined;
    if (payout.partner.paymentDetails) {
      try {
        paymentDetails = JSON.parse(payout.partner.paymentDetails);
      } catch {}
    }

    const details: PayoutDetails = {
      payoutId: payout.id,
      partnerId: payout.partnerId || payout.partner.id,
      amount: payout.totalCommission,
      currency: 'USD',
      partnerEmail: payout.partner.contactEmail || '',
      partnerPaymentDetails: paymentDetails,
    };

    // Determine payment method
    const paymentMethod = payout.payoutMethod || 'manual';
    let result: PaymentResult;

    switch (paymentMethod) {
      case 'stripe':
        result = await processStripePayment(details);
        break;

      case 'paypal':
        result = await processPayPalPayment(details);
        break;

      case 'bank_transfer':
      case 'check':
      case 'crypto':
      default:
        // Manual processing - just mark as processing
        result = {
          success: true,
          provider: 'manual',
          transactionId: `manual_${Date.now()}`,
          metadata: { requiresManualAction: true },
        };
    }

    // Update payout status if successful
    if (result.success) {
      await prisma.affiliatePayout.update({
        where: { id: payoutId },
        data: {
          payoutStatus: result.provider === 'manual' ? 'processing' : 'completed',
          transactionReference: result.transactionId,
          payoutDate: result.provider !== 'manual' ? new Date() : null,
        },
      });

      // Update conversions
      if (result.provider !== 'manual') {
        await prisma.affiliateConversion.updateMany({
          where: { payoutId },
          data: { payoutStatus: 'paid' },
        });
      }
    }

    return result;
  } catch (error) {
    console.error('[Payment] Processing failed:', error);
    return {
      success: false,
      provider: 'manual',
      error: error instanceof Error ? error.message : 'Payment processing failed',
    };
  }
}

/**
 * Get available payment methods for a partner
 */
export async function getPartnerPaymentMethods(partnerId: string): Promise<{
  stripe: { available: boolean; accountId?: string; status?: string };
  paypal: { available: boolean; email?: string };
  manual: { available: boolean };
}> {
  const partner = await prisma.affiliatePartner.findUnique({
    where: { id: partnerId },
    select: { paymentDetails: true, contactEmail: true },
  });

  let paymentDetails: Record<string, unknown> = {};
  if (partner?.paymentDetails) {
    try {
      paymentDetails = JSON.parse(partner.paymentDetails);
    } catch {}
  }

  // Check Stripe status
  let stripeStatus: { available: boolean; accountId?: string; status?: string } = {
    available: false,
  };
  
  if (paymentDetails.stripeAccountId) {
    const status = await checkStripeAccountStatus(paymentDetails.stripeAccountId as string);
    stripeStatus = {
      available: status.isActive,
      accountId: paymentDetails.stripeAccountId as string,
      status: status.payoutsEnabled ? 'active' : 'pending',
    };
  }

  return {
    stripe: stripeStatus,
    paypal: {
      available: !!(paymentDetails.paypalEmail || partner?.contactEmail),
      email: (paymentDetails.paypalEmail as string) || partner?.contactEmail || undefined,
    },
    manual: { available: true },
  };
}
