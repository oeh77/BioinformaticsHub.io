
"use client";

import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, CheckCircle, Zap, Shield, Gift } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function NewsletterPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsLoading(false);
    setIsSubscribed(true);
    toast.success("Successfully subscribed to the newsletter!");
    setEmail("");
  };

  return (
    <div className="min-h-screen pb-20">
      <PageHeader 
        title="Bioinformatics Weekly"
        subtitle="Join 5,000+ researchers staying updated with the latest tools, tutorials, and breakthroughs."
        backgroundImage="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1600&auto=format&fit=crop&q=80"
      />

      <div className="container mx-auto px-4 -mt-10 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Main Subscription Card */}
          <div className="glass-card p-8 md:p-12 rounded-3xl shadow-2xl border border-white/10 mb-12">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary shadow-inner">
                <Mail className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Subscribe to our Newsletter</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Get a weekly digest of the best new bioinformatics tools, Python/R tutorials, 
                and industry jobs delivered straight to your inbox. No spam, ever.
              </p>
            </div>

            {!isSubscribed ? (
              <form onSubmit={handleSubscribe} className="max-w-md mx-auto space-y-4">
                <div className="space-y-2">
                  <Input 
                    type="email" 
                    placeholder="Enter your email address" 
                    className="h-12 bg-white/5 border-white/10 text-lg"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    We care about your data in our <a href="/privacy" className="underline hover:text-primary">privacy policy</a>.
                  </p>
                </div>
                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full h-12 text-lg font-semibold shadow-lg shadow-primary/25"
                  disabled={isLoading}
                >
                  {isLoading ? "Subscribing..." : "Join the Community"}
                </Button>
              </form>
            ) : (
              <div className="text-center p-8 bg-green-500/10 rounded-2xl border border-green-500/20">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-green-500 mb-2">Welcome Aboard!</h3>
                <p className="text-muted-foreground">
                  You&apos;ve successfully verified your email. Look out for our next issue this Tuesday!
                </p>
              </div>
            )}
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="glass-card p-6 rounded-2xl">
              <Zap className="w-8 h-8 text-yellow-500 mb-4" />
              <h3 className="font-bold text-lg mb-2">Latest Tools</h3>
              <p className="text-sm text-muted-foreground">
                Discover new packages and software before they become mainstream standards.
              </p>
            </div>
            <div className="glass-card p-6 rounded-2xl">
              <Gift className="w-8 h-8 text-pink-500 mb-4" />
              <h3 className="font-bold text-lg mb-2">Exclusive Tuts</h3>
              <p className="text-sm text-muted-foreground">
                Get step-by-step guides and code snippets for common analysis pipelines.
              </p>
            </div>
            <div className="glass-card p-6 rounded-2xl">
              <Shield className="w-8 h-8 text-blue-500 mb-4" />
              <h3 className="font-bold text-lg mb-2">Career Tips</h3>
              <p className="text-sm text-muted-foreground">
                Insights on landing jobs, interviewing, and building your portfolio.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
