/**
 * Partner Portal - Login Page
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Building2, Key, AlertCircle, ArrowRight } from "lucide-react";

export default function PartnerLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    partnerId: "",
    apiKey: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/affiliate/partner/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Login failed");
      }

      // Redirect to partner dashboard
      router.push("/partner");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo / Branding */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              BioinformaticsHub
            </h1>
          </Link>
          <p className="text-white/60 mt-2">Partner Portal</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">Partner Sign In</h2>
            <p className="text-sm text-white/60 mt-1">
              Access your affiliate dashboard
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 mb-6 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Partner ID
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="text"
                  value={formData.partnerId}
                  onChange={(e) =>
                    setFormData({ ...formData, partnerId: e.target.value })
                  }
                  required
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Enter your partner ID"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                API Key
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="password"
                  value={formData.apiKey}
                  onChange={(e) =>
                    setFormData({ ...formData, apiKey: e.target.value })
                  }
                  required
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Enter your API key"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary hover:bg-primary/80 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <p className="text-sm text-white/60">
              Don&apos;t have a partner account?{" "}
              <Link href="/contact" className="text-primary hover:underline">
                Contact us
              </Link>
            </p>
          </div>
        </div>

        {/* Help text */}
        <p className="text-center text-sm text-white/40 mt-6">
          Your Partner ID and API Key were provided when you joined the affiliate program.
          Contact support if you need help accessing your account.
        </p>
      </div>
    </div>
  );
}
