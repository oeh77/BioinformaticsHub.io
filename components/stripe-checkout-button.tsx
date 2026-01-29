"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CreditCard, Loader2 } from "lucide-react";

export function StripeCheckoutButton() {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error("Something went wrong");
      }

      window.location.href = data.url;
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleCheckout} 
      disabled={loading}
      variant="premium"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <CreditCard className="w-4 h-4 mr-2" />
      )}
      Upgrade to Premium
    </Button>
  );
}
