import { auth } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const user = session?.user;

    if (!user || !user.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // In a real app, you would validate the product/price ID from the request body
    // const { priceId } = await req.json();

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment", // or 'subscription'
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "BioinformaticsHub Premium",
              description: "Premium access",
            },
            unit_amount: 2000, // $20.00
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?canceled=true`,
      metadata: {
        userId: user.id || "",
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("[STRIPE_CHECKOUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
