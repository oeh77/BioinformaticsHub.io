
import { PageHeader } from "@/components/ui/page-header";
import { AlertTriangle, TrendingUp, DollarSign } from "lucide-react";

export const metadata = {
  title: "Affiliate Disclosure | BioinformaticsHub",
  description: "Transparency about our affiliate relationships and funding.",
};

export default function AffiliatePage() {
  return (
    <div className="min-h-screen pb-20">
      <PageHeader 
        title="Affiliate Disclosure"
        subtitle="Transparency matters. Here is how we fund our platform."
        backgroundImage="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1600&auto=format&fit=crop&q=80"
      />

      <div className="container mx-auto px-4 -mt-10 relative z-10">
        <div className="max-w-4xl mx-auto glass-card p-8 md:p-12 rounded-3xl shadow-xl">
          <div className="prose dark:prose-invert prose-lg max-w-none">
            <div className="bg-yellow-500/10 border border-yellow-500/20 p-6 rounded-2xl mb-8 flex gap-4 items-start">
              <AlertTriangle className="w-6 h-6 text-yellow-500 shrink-0 mt-1" />
              <div>
                <h4 className="text-yellow-500 font-bold m-0 mb-2">TL;DR</h4>
                <p className="m-0 text-sm opacity-90">
                  Some links on BioinformaticsHub.io are affiliate links. This means if you click on the link and purchase the item, we may receive an affiliate commission at no extra cost to you.
                </p>
              </div>
            </div>

            <p className="lead">
              BioinformaticsHub.io is committed to providing high-quality, unbiased information. To support the operation of this website, we participate in various affiliate marketing programs.
            </p>

            <h3>How It Works</h3>
            <p>
              When you click on links to various merchants on this site and make a purchase, this can result in this site earning a commission. Affiliate programs and affiliations include, but are not limited to, the Amazon Associate Program, Coursera, Udemy, and edX.
            </p>

            <div className="grid md:grid-cols-2 gap-6 my-8">
              <div className="glass p-6 rounded-xl">
                <TrendingUp className="w-8 h-8 text-green-500 mb-4" />
                <h4 className="font-bold mb-2">No Extra Cost</h4>
                <p className="text-sm text-muted-foreground">
                  The price of the item is the same whether it is an affiliate link or not. Using our links is a great way to support the site for free.
                </p>
              </div>
              <div className="glass p-6 rounded-xl">
                <DollarSign className="w-8 h-8 text-blue-500 mb-4" />
                <h4 className="font-bold mb-2">Editorial Independence</h4>
                <p className="text-sm text-muted-foreground">
                  Our reviews and recommendations are based on our own research and analysis. Affiliate partnerships do not influence our content.
                </p>
              </div>
            </div>

            <h3>Amazon Associates Program</h3>
            <p>
              BioinformaticsHub.io is a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.com.
            </p>

            <h3>Our Commitment to You</h3>
            <p>
              We only recommend products or services that we believe will add value to our readers. Our goal is to help you navigate the complex world of bioinformatics with the best tools and resources available.
            </p>

            <p>
              If you have any questions regarding the above, please do not hesitate to contact us by using the contact page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
