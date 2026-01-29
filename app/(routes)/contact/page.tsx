"use client";

import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, MapPin, Send, MessageSquare, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ContactFormContent() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const searchParams = useSearchParams();
  const [showSuccess, setShowSuccess] = useState(false);
  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setShowSuccess(true);
      // Clear URL param to avoid stale state on refresh (optional, but good UX)
      window.history.replaceState({}, '', '/contact');
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen pb-20">
      <PageHeader 
        title="Contact Us"
        subtitle="Have questions? We'd love to hear from you."
        backgroundImage="https://images.unsplash.com/photo-1516387938699-a93567ec168e?w=1600&auto=format&fit=crop&q=80"
      />

      <div className="container mx-auto px-4 -mt-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Contact Info & Welcome */}
          <div className="space-y-8">
            <div className="glass-card p-8 rounded-3xl shadow-xl">
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
                <MessageSquare className="w-8 h-8 text-primary" />
                Welcome!
              </h2>
              {/* ... existing content ... */}
              <div className="prose dark:prose-invert text-lg text-muted-foreground leading-relaxed">
                <p>
                  Thank you for visiting BioinformaticsHub.io. We are dedicated to building the most comprehensive resource for the bioinformatics community, and your feedback is invaluable to us.
                </p>
                <p>
                  Whether you have a suggestion for a new tool, found a bug, or just want to discuss the latest trends in computational biology, we are here to listen. Fill out the form, and we&apos;ll get back to you as soon as possible.
                </p>
              </div>

              <div className="mt-8 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Email Us</h4>
                    <p className="text-muted-foreground">omarehamad7@gmail.com</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Location</h4>
                    <p className="text-muted-foreground">Global / Remote</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* FAQ Teaser */}
            <div className="glass-card p-8 rounded-3xl opacity-80 hover:opacity-100 transition-opacity">
              <h3 className="font-bold text-xl mb-4">Frequently Asked Questions</h3>
              <p className="text-muted-foreground mb-4">
                Before you contact us, check our FAQ. You might find the answer you&apos;re looking for!
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/faq">Visit FAQ Center</Link>
              </Button>
            </div>
          </div>

          {/* Contact Form */}
          <div className="glass-card p-8 md:p-10 rounded-3xl shadow-2xl border-t-4 border-primary">
            <h3 className="text-2xl font-bold mb-6">Send us a Message</h3>
            
            {showSuccess ? (
              <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in duration-500">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-green-500 mb-2">Message Sent!</h3>
                <p className="text-muted-foreground max-w-sm mb-6">
                  Thank you for reaching out. We&apos;ve received your message and will get back to you shortly.
                </p>
                <Button onClick={() => setShowSuccess(false)} variant="outline">
                  Send Another Message
                </Button>
              </div>
            ) : (
            <form 
              action="https://formsubmit.co/omarehamad7@gmail.com" 
              method="POST"
              className="space-y-6"
              onSubmit={() => setIsSubmitting(true)}
            >
              {/* FormSubmit Configuration */}
              <input type="hidden" name="_subject" value="New Contact Request from BioinformaticsHub" />
              <input type="hidden" name="_next" value="http://localhost:3000/contact?success=true" />
              <input type="hidden" name="_captcha" value="false" />
              <input type="hidden" name="_template" value="table" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium ml-1">Name</label>
                  <Input 
                    id="name" 
                    name="name" 
                    placeholder="Dr. Jane Doe" 
                    required 
                    className="bg-white/5 border-white/10 h-12"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium ml-1">Email</label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    placeholder="jane@institute.edu" 
                    required 
                    className="bg-white/5 border-white/10 h-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium ml-1">Subject</label>
                <Input 
                  id="subject" 
                  name="subject" 
                  placeholder="Collaboration Proposal / Tool Suggestion" 
                  required 
                  className="bg-white/5 border-white/10 h-12"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium ml-1">Message</label>
                <textarea 
                  id="message" 
                  name="message" 
                  placeholder="How can we help you today?" 
                  required 
                  rows={6}
                  className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[120px]"
                />
              </div>

              <Button 
                type="submit" 
                size="lg" 
                className="w-full h-12 text-lg font-semibold shadow-lg shadow-primary/20"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : (
                  <span className="flex items-center gap-2">
                    Send Message <Send className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </form>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default function ContactPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <ContactFormContent />
    </Suspense>
  );
}
