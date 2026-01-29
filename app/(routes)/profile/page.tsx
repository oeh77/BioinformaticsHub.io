"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { StripeCardForm } from "@/components/stripe-card-form";
import { User, Mail, Calendar, Edit2, Save, X, Loader2, Shield, CreditCard, Settings, Trash2, Plus } from "lucide-react";

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  
  // Tabs: account, security, payments, preferences
  const [activeTab, setActiveTab] = useState("account");

  // Account Tab State
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [accountMessage, setAccountMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Security Tab State
  const [pwdCurrent, setPwdCurrent] = useState("");
  const [pwdNew, setPwdNew] = useState("");
  const [pwdConfirm, setPwdConfirm] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdMessage, setPwdMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Payments Tab State
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showCardForm, setShowCardForm] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/profile");
    }
    if (session?.user?.name) {
      setName(session.user.name);
    }
  }, [status, session, router]);

  useEffect(() => {
    if (activeTab === "payments") {
      fetchPaymentMethods();
    }
  }, [activeTab]);

  const fetchPaymentMethods = async () => {
    setPaymentsLoading(true);
    try {
      const res = await fetch("/api/profile/payment-methods");
      if (res.ok) {
        const data = await res.json();
        setPaymentMethods(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setPaymentsLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    setIsSaving(true);
    setAccountMessage(null);
    
    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      await update({ name });
      setIsEditing(false);
      setAccountMessage({ type: "success", text: "Profile updated successfully!" });
    } catch {
      setAccountMessage({ type: "error", text: "Failed to update profile. Please try again." });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (pwdNew !== pwdConfirm) {
      setPwdMessage({ type: "error", text: "New passwords do not match" });
      return;
    }
    if (pwdNew.length < 6) {
      setPwdMessage({ type: "error", text: "Password must be at least 6 characters" });
      return;
    }

    setPwdLoading(true);
    setPwdMessage(null);

    try {
      const res = await fetch("/api/profile/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: pwdCurrent, newPassword: pwdNew }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update password");
      }

      setPwdMessage({ type: "success", text: "Password updated successfully!" });
      setPwdCurrent("");
      setPwdNew("");
      setPwdConfirm("");
    } catch (error: any) {
      setPwdMessage({ type: "error", text: error.message });
    } finally {
      setPwdLoading(false);
    }
  };

  const handlePaymentAdded = (newMethod: any) => {
    setPaymentMethods((prev) => [newMethod, ...prev]);
    setShowCardForm(false);
    setPaymentMessage({ type: "success", text: "Card added successfully" });
  };

  const handleDeletePayment = async (id: string) => {
    if (!confirm("Are you sure you want to remove this payment method?")) return;

    try {
      const res = await fetch(`/api/profile/payment-methods/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setPaymentMethods(prev => prev.filter(p => p.id !== id));
        setPaymentMessage({ type: "success", text: "Payment method removed" });
      } else {
        setPaymentMessage({ type: "error", text: "Failed to remove payment method" });
      }
    } catch {
      setPaymentMessage({ type: "error", text: "Error removing payment method" });
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) return null;

  const initials = session.user.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : session.user.email?.[0].toUpperCase() || "U";

  const renderTabContent = () => {
    switch (activeTab) {
      case "account":
        return (
          <div className="glass rounded-2xl p-8 border border-white/10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <User className="h-5 w-5 text-primary" /> Personal Information
            </h2>

            <div className="flex flex-col items-center mb-8">
              {session.user.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  className="h-24 w-24 rounded-full object-cover ring-4 ring-primary/20"
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-2xl font-bold box-shadow-glow">
                  {initials}
                </div>
              )}
            </div>

            {accountMessage && (
              <div
                className={`mb-6 p-4 rounded-lg text-center text-sm border backdrop-blur-md ${
                  accountMessage.type === "success"
                    ? "bg-green-500/10 text-green-500 border-green-500/20"
                    : "bg-red-500/10 text-red-500 border-red-500/20"
                }`}
              >
                {accountMessage.text}
              </div>
            )}

            <div className="space-y-6">
              <div className="group">
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Full Name</label>
                <div className="relative">
                  {isEditing ? (
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-white/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300"
                    />
                  ) : (
                    <div className="px-4 py-2.5 rounded-xl bg-secondary/30 border border-transparent text-foreground font-medium">
                      {session.user.name || "Not set"}
                    </div>
                  )}
                </div>
              </div>

              <div className="group">
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Email Address</label>
                <div className="px-4 py-2.5 rounded-xl bg-secondary/30 border border-transparent text-muted-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4 opacity-50" />
                  {session.user.email}
                </div>
              </div>

              <div className="group">
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Member Since</label>
                <div className="px-4 py-2.5 rounded-xl bg-secondary/30 border border-transparent text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4 opacity-50" />
                  January 2026
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-3 justify-end pt-6 border-t border-white/5">
              {isEditing ? (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setIsEditing(false);
                      setName(session.user.name || "");
                    }}
                    className="hover:bg-red-500/10 hover:text-red-500"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button onClick={handleProfileUpdate} disabled={isSaving} className="bg-primary hover:bg-primary/90">
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save Changes
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)} variant="outline" className="border-primary/20 hover:border-primary/50 hover:bg-primary/5">
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        );

      case "security":
        return (
          <div className="glass rounded-2xl p-8 border border-white/10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" /> Security Settings
            </h2>
            
            <div className="space-y-6 max-w-lg">
              <div>
                <h3 className="text-lg font-medium mb-4">Change Password</h3>
                {pwdMessage && (
                   <div
                   className={`mb-6 p-4 rounded-lg text-center text-sm border backdrop-blur-md ${
                     pwdMessage.type === "success"
                       ? "bg-green-500/10 text-green-500 border-green-500/20"
                       : "bg-red-500/10 text-red-500 border-red-500/20"
                   }`}
                 >
                   {pwdMessage.text}
                 </div>
                )}
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Current Password</label>
                    <input
                      type="password"
                      value={pwdCurrent}
                      onChange={(e) => setPwdCurrent(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-white/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">New Password</label>
                    <input
                      type="password"
                      value={pwdNew}
                      onChange={(e) => setPwdNew(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-white/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                       placeholder="••••••••"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Confirm New Password</label>
                    <input
                      type="password"
                      value={pwdConfirm}
                      onChange={(e) => setPwdConfirm(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-white/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                       placeholder="••••••••"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <Button 
                      onClick={handlePasswordChange} 
                      disabled={pwdLoading} 
                      className="bg-primary hover:bg-primary/90"
                    >
                      {pwdLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                      Update Password
                    </Button>
                    <button 
                      onClick={async () => {
                         if(!session?.user?.email) return;
                         if(!confirm("Send password reset email?")) return;
                         await fetch('/api/profile/password/reset', {
                           method: 'POST',
                           headers: {'Content-Type': 'application/json'},
                           body: JSON.stringify({email: session.user.email})
                         });
                         alert("Reset link sent if account exists.");
                      }}
                      className="text-sm text-primary hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "payments":
        return (
          <div className="glass rounded-2xl p-8 border border-white/10 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" /> Payment Methods
              </h2>
              {!showCardForm && (
                <Button size="sm" onClick={() => setShowCardForm(true)} disabled={paymentsLoading}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Card
                </Button>
              )}
            </div>

            {paymentMessage && (
               <div
               className={`mb-6 p-4 rounded-lg text-center text-sm border backdrop-blur-md ${
                 paymentMessage.type === "success"
                   ? "bg-green-500/10 text-green-500 border-green-500/20"
                   : "bg-red-500/10 text-red-500 border-red-500/20"
               }`}
             >
               {paymentMessage.text}
             </div>
            )}

            {showCardForm && (
              <div className="mb-6 p-6 rounded-xl bg-secondary/30 border border-white/10">
                <h3 className="text-lg font-medium mb-4">Add a new card</h3>
                <StripeCardForm 
                  onSuccess={handlePaymentAdded}
                  onCancel={() => setShowCardForm(false)}
                />
              </div>
            )}

            <div className="space-y-4">
              {paymentMethods.length === 0 && !showCardForm ? (
                <div className="text-center py-12 text-muted-foreground bg-secondary/20 rounded-xl border border-dashed border-white/10">
                  <CreditCard className="h-10 w-10 mx-auto mb-3 opacity-20" />
                  <p>No payment methods saved yet.</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setShowCardForm(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Card
                  </Button>
                </div>
              ) : paymentMethods.length > 0 && (
                <div className="grid gap-4">
                  {paymentMethods.map((pm) => (
                    <div key={pm.id} className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-white/5 hover:border-primary/20 transition-all duration-300">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-8 bg-white/10 rounded flex items-center justify-center font-bold text-xs uppercase">
                          {pm.brand}
                        </div>
                        <div>
                          <p className="font-medium">•••• •••• •••• {pm.last4}</p>
                          <p className="text-xs text-muted-foreground">Expires {pm.expMonth}/{pm.expYear}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleDeletePayment(pm.id)} className="text-red-500 hover:bg-red-500/10" aria-label="Delete payment method">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <p className="text-xs text-muted-foreground mt-6 flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Payments are securely processed via Stripe. Your card details are never stored on our servers.
            </p>
          </div>
        );

      case "preferences":
        return (
          <div className="glass rounded-2xl p-8 border border-white/10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" /> Preferences
            </h2>
            
            <div className="space-y-8 max-w-lg">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Email Notifications</h3>
                <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-white/5">
                  <div>
                    <p className="font-medium">Marketing Emails</p>
                    <p className="text-sm text-muted-foreground">Receive updates about new features and promotions.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      aria-label="Toggle Marketing Emails"
                      defaultChecked={true} // In real app, bind to session.user.marketingEmails
                      onChange={(e) => {
                         fetch('/api/user/profile', {
                           method: 'PATCH',
                           headers: {'Content-Type': 'application/json'},
                           body: JSON.stringify({ marketingEmails: e.target.checked })
                         });
                      }}
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-white/5">
                  <div>
                    <p className="font-medium">Security Alerts</p>
                    <p className="text-sm text-muted-foreground">Receive emails about your account security.</p>
                  </div>
                   <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      aria-label="Toggle Security Alerts"
                      defaultChecked={true}
                      onChange={(e) => {
                         fetch('/api/user/profile', {
                           method: 'PATCH',
                           headers: {'Content-Type': 'application/json'},
                           body: JSON.stringify({ securityEmails: e.target.checked })
                         });
                      }}
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Regional Settings</h3>
                <div className="space-y-2">
                  <label htmlFor="language-select" className="text-sm font-medium text-muted-foreground">Language</label>
                  <select 
                    id="language-select"
                    className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-white/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    defaultValue="en"
                    onChange={(e) => {
                       fetch('/api/user/profile', {
                           method: 'PATCH',
                           headers: {'Content-Type': 'application/json'},
                           body: JSON.stringify({ language: e.target.value })
                         });
                    }}
                  >
                    <option value="en">English (US)</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-3">
            Account Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your personal information, security, and billing details
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="md:w-64 flex-shrink-0">
            <div className="glass rounded-2xl p-2 border border-white/10 sticky top-24">
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab("account")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                    activeTab === "account"
                      ? "bg-primary text-white shadow-lg shadow-primary/25"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  }`}
                >
                  <User className="h-4 w-4" /> Account
                </button>
                <button
                  onClick={() => setActiveTab("security")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                    activeTab === "security"
                      ? "bg-primary text-white shadow-lg shadow-primary/25"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  }`}
                >
                  <Shield className="h-4 w-4" /> Security
                </button>
                <button
                  onClick={() => setActiveTab("payments")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                    activeTab === "payments"
                      ? "bg-primary text-white shadow-lg shadow-primary/25"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  }`}
                >
                  <CreditCard className="h-4 w-4" /> Payments
                </button>
                <button
                  onClick={() => setActiveTab("preferences")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                    activeTab === "preferences"
                      ? "bg-primary text-white shadow-lg shadow-primary/25"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  }`}
                >
                  <Settings className="h-4 w-4" /> Preferences
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
