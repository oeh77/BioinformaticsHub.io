import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    return new NextResponse(`Webhook Error: ${error instanceof Error ? error.message : "Unknown error"}`, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (event.type === "checkout.session.completed") {
    // Fulfill the purchase...
    if (!session?.metadata?.userId) {
       return new NextResponse("Webhook Error: No user ID in metadata", { status: 400 });
    }

    // Example: Save payment method or upgrade user
    await prisma.user.update({
        where: { id: session.metadata.userId },
        data: {
            // Update user status or add relevant record
            // e.g. isPro: true
        }
    });
    
    // Also save payment method if applicable
    if (session.payment_intent && typeof session.payment_intent === 'string') {
        const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent);
        if (paymentIntent.payment_method && typeof paymentIntent.payment_method === 'string') {
             // Logic to save payment method details using prisma.paymentMethod.create
        }
    }
  }

  return new NextResponse(null, { status: 200 });
}
