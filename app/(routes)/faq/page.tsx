
import { PageHeader } from "@/components/ui/page-header";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata = {
  title: "FAQ | BioinformaticsHub",
  description: "Frequently Asked Questions about BioinformaticsHub.io tools, resources, and community.",
};

const faqs = [
  {
    question: "Is BioinformaticsHub free to use?",
    answer: "Yes! The core directory of tools, learning paths, and blog resources is completely free for the community. We are supported by affiliate partnerships and optional premium job listings."
  },
  {
    question: "Can I submit my own tool to the directory?",
    answer: "Absolutely. We encourage developers to submit their tools. Navigate to the directory page and look for the 'Submit Tool' button. All submissions are reviewed by our team to ensure quality."
  },
  {
    question: "How often is the content updated?",
    answer: "We update our tool directory weekly and publish new articles and tutorials every Tuesday. Our 'AI in Biology' section is updated daily with the latest breakthroughs."
  },
  {
    question: "Do you offer certificates for the learning paths?",
    answer: "Currently, our learning paths are self-guided roadmaps using third-party resources. While we don't issue certificates directly, many of the linked courses (like Coursera or edX) do provide certification upon completion."
  },
  {
    question: "How can I contribute to the blog?",
    answer: "We love guest posts! If you have expertise in a specific bioinformatics niche, please contact us via the form on the Contact page with your topic proposal."
  },
  {
    question: "What is the tech stack behind this platform?",
    answer: "BioinformaticsHub is built using Next.js 14, React, Tailwind CSS, and Prisma with a PostgreSQL database. It's designed for performance and SEO."
  }
];

export default function FAQPage() {
  return (
    <div className="min-h-screen pb-20">
      <PageHeader 
        title="Frequently Asked Questions"
        subtitle="Find answers to common questions about our platform and mission."
        backgroundImage="https://images.unsplash.com/photo-1633613286991-611fe299c4be?w=1600&auto=format&fit=crop&q=80"
      />

      <div className="container mx-auto px-4 -mt-10 relative z-10">
        <div className="max-w-3xl mx-auto glass-card p-8 md:p-12 rounded-3xl shadow-xl">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-white/10">
                <AccordionTrigger className="text-lg font-semibold hover:text-primary transition-colors text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
}
