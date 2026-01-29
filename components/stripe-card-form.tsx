"use client";

import { useState } from "react";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { loadStripe, StripeCardElementOptions } from "@stripe/stripe-js";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

const CARD_ELEMENT_OPTIONS: StripeCardElementOptions = {
  style: {
    base: {
      color: "#fff",
      fontSize: "16px",
      fontFamily: '"Inter", system-ui, sans-serif',
      "::placeholder": {
        color: "#888",
      },
    },
    invalid: {
      color: "#ef4444",
      iconColor: "#ef4444",
    },
  },
};

interface PaymentMethod {
  id: string;
  brand: string | null;
  last4: string | null;
  expMonth: number | null;
  expYear: number | null;
  isDefault: boolean;
}

interface CardFormProps {
  onSuccess: (method: PaymentMethod) => void;
  onCancel: () => void;
}

function CardForm({ onSuccess, onCancel }: CardFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setError("Card element not found");
      setIsLoading(false);
      return;
    }

    // Create a PaymentMethod
    const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: cardElement,
    });

    if (stripeError) {
      setError(stripeError.message || "An error occurred");
      setIsLoading(false);
      return;
    }

    // Send to our API to attach to customer
    try {
      const res = await fetch("/api/profile/payment-methods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethodId: paymentMethod.id }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add payment method");
      }

      const savedMethod = await res.json();
      
      toast({
        title: "Card added successfully",
        description: `Added card ending in ${savedMethod.last4}`,
      });

      onSuccess(savedMethod);
    } catch (err) {
      setError((err as Error).message || "Failed to save payment method");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 rounded-lg bg-background/50 border border-border/50">
        <CardElement options={CARD_ELEMENT_OPTIONS} />
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={!stripe || isLoading}
          className="flex-1"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <CreditCard className="h-4 w-4 mr-2" />
          )}
          Add Card
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

interface StripeCardFormProps {
  onSuccess: (method: PaymentMethod) => void;
  onCancel: () => void;
}

export function StripeCardForm({ onSuccess, onCancel }: StripeCardFormProps) {
  return (
    <Elements stripe={stripePromise}>
      <CardForm onSuccess={onSuccess} onCancel={onCancel} />
    </Elements>
  );
}
