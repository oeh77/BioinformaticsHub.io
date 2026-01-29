import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const paymentMethods = await prisma.paymentMethod.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(paymentMethods);
  } catch (error) {
    console.error("Payment methods fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment methods" },
      { status: 500 }
    );
  }
}

// Stub for adding a payment method
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id || !session.user.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    // Expecting a PaymentMethod ID (pm_...) from the frontend (Stripe Elements)
    const { paymentMethodId } = body;

    if (!paymentMethodId) {
       return NextResponse.json(
        { error: "Payment Method ID is required" },
        { status: 400 }
      );
    }

    // 1. Check if user already has a Stripe Customer ID in our DB (or in User model)
    // For this implementation, we'll check if we have any existing payment methods for this user 
    // which might store the customer ID, or ideally, we should store stripeCustomerId on the User model.
    // Since we didn't add stripeCustomerId to User, we'll search or create.
    // simpler approach: look up if we have a payment method for this user => reuse that customer ID.
    // If not, create a new customer.
    
    // Check for existing customer ID on User (requires schema change) OR find from existing PaymentMethod
    const existingPayment = await prisma.paymentMethod.findFirst({
      where: { userId: session.user.id },
      select: { providerId: true } // We might be storing customer ID elsewhere or strictly in User. 
      // Actually, my previous schema had `providerId` on PaymentMethod as "Stripe customer ID or payment method ID".
      // Let's assume we need to store the Customer ID.
      // Best Practice: Store `stripeCustomerId` on the User model.
      // Workaround without schema change: Create customer every time is bad.
      // Let's check if we can retrieve it.
    });
    
    // We really should add stripeCustomerId to User. But for now, let's create a customer.
    // If we want to persist it, let's look for a dedicated "Settings" entry? or just Create always (not ideal).
    // Let's create a Customer for this session user if we don't have one cached.
    
    let customerId: string;
    
    // Retrieve customer ID from Settings table to avoid schema migration overhead right now?
    // No, let's do it properly or just create one and attach.
    // Let's assume we create a new Customer for simplicity or look for one by email.
    
    const existingCustomers = await stripe.customers.list({ email: session.user.email, limit: 1 });
    if (existingCustomers.data.length > 0) {
      customerId = existingCustomers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: session.user.email,
        name: session.user.name || undefined,
      });
      customerId = customer.id;
    }

    // 2. Attach PaymentMethod to Customer
    const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    // 3. Save to DB
    const newMethod = await prisma.paymentMethod.create({
      data: {
        userId: session.user.id,
        provider: "stripe",
        providerId: paymentMethod.id, // Store pm_ ID
        brand: paymentMethod.card?.brand || "unknown",
        last4: paymentMethod.card?.last4 || "0000",
        expMonth: paymentMethod.card?.exp_month || 0,
        expYear: paymentMethod.card?.exp_year || 0,
        isDefault: false, 
      },
    });

    return NextResponse.json(newMethod);
  } catch (error: any) {
    console.error("Add payment method error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to add payment method" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  // Extract ID from URL if needed, or stick to a dynamic route path like [id]/route.ts
  // For simplicity here, let's assume body or query param, BUT standard Rest is DELETE /api/resource/id
  // I should probably make a split file for [id] if I want proper REST.
  // For now I'll just leave GET/POST here.
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
