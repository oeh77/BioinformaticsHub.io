/**
 * Affiliate Disclosure Page
 * 
 * FTC-compliant disclosure page for affiliate relationships
 */

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Affiliate Disclosure | BioinformaticsHub.io",
  description:
    "Disclosure of affiliate relationships and how we earn commissions from product recommendations.",
};

export default function AffiliateDisclosurePage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <article className="prose prose-invert prose-lg max-w-none">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Affiliate Disclosure
        </h1>

        <p className="text-lg text-white/80 mb-8">
          Last updated: {new Date().toLocaleDateString("en-US", { 
            year: "numeric", 
            month: "long", 
            day: "numeric" 
          })}
        </p>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Our Commitment to Transparency</h2>
          <p>
            BioinformaticsHub.io is committed to providing honest, valuable, and 
            transparent resources for the bioinformatics community. In accordance 
            with the Federal Trade Commission (FTC) guidelines, we want to be 
            completely upfront about how we earn money from this website.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Affiliate Partnerships</h2>
          <p>
            BioinformaticsHub.io participates in various affiliate marketing programs. 
            This means that we may earn commissions on purchases made through links 
            on our website to partner websites. These affiliate partnerships include, 
            but are not limited to:
          </p>
          
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li>
              <strong>Bioinformatics Software & SaaS Tools</strong> - We partner with 
              software companies offering bioinformatics analysis platforms, cloud 
              computing solutions, and data visualization tools.
            </li>
            <li>
              <strong>Laboratory Equipment & Reagents</strong> - We may earn commissions 
              when you purchase sequencing equipment, lab supplies, or reagents through 
              our recommendations.
            </li>
            <li>
              <strong>DNA Sequencing Services</strong> - Links to NGS platforms and 
              sequencing service providers may be affiliate links.
            </li>
            <li>
              <strong>Cloud Computing for Genomics</strong> - Recommendations for AWS, 
              Google Cloud, Azure, or specialized genomics cloud platforms may include 
              affiliate links.
            </li>
            <li>
              <strong>Online Courses & Certifications</strong> - Educational content 
              recommendations from platforms like Coursera, Udemy, edX, and specialized 
              bioinformatics training providers.
            </li>
            <li>
              <strong>Research Books & Publications</strong> - Links to textbooks and 
              publications on Amazon or other book retailers.
            </li>
            <li>
              <strong>Conference & Event Tickets</strong> - Promotions for bioinformatics 
              conferences and workshops.
            </li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">How We Use Affiliate Links</h2>
          <p>
            When you click on an affiliate link and make a purchase, we may receive 
            a small commission at no additional cost to you. These commissions help 
            support the ongoing operation of BioinformaticsHub.io, including:
          </p>
          
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li>Server and hosting costs</li>
            <li>Content creation and curation</li>
            <li>Development of free tools and resources</li>
            <li>Maintaining our tool directory and job board</li>
            <li>Community support and moderation</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Our Editorial Policy</h2>
          <p>
            <strong>We only recommend products and services we genuinely believe in.</strong>
          </p>
          <p>
            Our editorial content is created independently from our affiliate 
            partnerships. The presence of affiliate links does not influence our 
            ratings, reviews, or recommendations. We evaluate all products and 
            services based on:
          </p>
          
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li>Scientific merit and accuracy</li>
            <li>Value for researchers and bioinformaticians</li>
            <li>Quality and reliability</li>
            <li>User reviews and community feedback</li>
            <li>Our own hands-on experience when applicable</li>
          </ul>
          
          <p className="mt-4">
            If we wouldn&apos;t recommend a product to a colleague, we won&apos;t 
            recommend it to you—regardless of the affiliate commission.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Identifying Affiliate Links</h2>
          <p>
            Affiliate links on BioinformaticsHub.io may be identified in several ways:
          </p>
          
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li>
              Links that use our short URL format: <code>bioinformaticshub.io/go/...</code>
            </li>
            <li>
              Disclosure notices near the beginning of articles containing affiliate links
            </li>
            <li>
              &quot;Check Price&quot; or &quot;View Pricing&quot; buttons that link to partner sites
            </li>
            <li>
              Product comparison tables with links to multiple retailers
            </li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Your Privacy</h2>
          <p>
            When you click an affiliate link, the partner website may use cookies 
            to track the referral. This helps attribute any subsequent purchase to 
            our recommendation. Please review our{" "}
            <a href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </a>{" "}
            for more information about how we handle your data.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Questions?</h2>
          <p>
            If you have any questions about our affiliate partnerships or this 
            disclosure, please{" "}
            <a href="/contact" className="text-primary hover:underline">
              contact us
            </a>
            . We&apos;re happy to provide additional information about any product 
            recommendations or affiliate relationships.
          </p>
        </section>

        <div className="mt-12 p-6 bg-white/5 border border-white/10 rounded-xl">
          <p className="text-sm text-white/60">
            <strong>Note:</strong> This affiliate disclosure complies with the 
            Federal Trade Commission (FTC) guidelines regarding endorsements and 
            testimonials. We are committed to maintaining transparent relationships 
            with our audience and partners.
          </p>
        </div>
      </article>
    </div>
  );
}
