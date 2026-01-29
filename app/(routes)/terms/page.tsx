
import { PageHeader } from "@/components/ui/page-header";

export const metadata = {
  title: "Terms of Use | BioinformaticsHub",
  description: "Terms and conditions for using BioinformaticsHub.io services.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen pb-20">
      <PageHeader 
        title="Terms of Use"
        subtitle="Last updated: January 2026"
        backgroundImage="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1600&auto=format&fit=crop&q=80"
      />

      <div className="container mx-auto px-4 -mt-10 relative z-10">
        <div className="max-w-4xl mx-auto glass-card p-8 md:p-12 rounded-3xl shadow-xl">
          <div className="prose dark:prose-invert prose-lg max-w-none">
            <p className="lead">
              Welcome to BioinformaticsHub.io! These terms and conditions outline the rules and regulations for the use of our website and services.
            </p>

            <h3>1. Terms</h3>
            <p>
              By accessing this website, you agree to be bound by these website Terms and Conditions of Use, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
            </p>

            <h3>2. Use License</h3>
            <p>
              Permission is granted to temporarily download one copy of the materials (information or software) on BioinformaticsHub.io for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul>
              <li>modify or copy the materials;</li>
              <li>use the materials for any commercial purpose, or for any public display (commercial or non-commercial);</li>
              <li>attempt to decompile or reverse engineer any software contained on BioinformaticsHub.io;</li>
              <li>remove any copyright or other proprietary notations from the materials; or</li>
              <li>transfer the materials to another person or &quot;mirror&quot; the materials on any other server.</li>
            </ul>

            <h3>3. Disclaimer</h3>
            <p>
              The materials on BioinformaticsHub.io are provided on an &apos;as is&apos; basis. BioinformaticsHub.io makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>

            <h3>4. Limitations</h3>
            <p>
              In no event shall BioinformaticsHub.io or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on BioinformaticsHub.io, even if BioinformaticsHub.io or a BioinformaticsHub.io authorized representative has been notified orally or in writing of the possibility of such damage.
            </p>

            <h3>5. Accuracy of Materials</h3>
            <p>
              The materials appearing on BioinformaticsHub.io could include technical, typographical, or photographic errors. BioinformaticsHub.io does not warrant that any of the materials on its website are accurate, complete or current. BioinformaticsHub.io may make changes to the materials contained on its website at any time without notice.
            </p>

            <h3>6. Links</h3>
            <p>
              BioinformaticsHub.io has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by BioinformaticsHub.io of the site. Use of any such linked website is at the user&apos;s own risk.
            </p>

            <h3>7. Modifications</h3>
            <p>
              BioinformaticsHub.io may revise these terms of service for its website at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms of service.
            </p>

            <h3>8. Governing Law</h3>
            <p>
              These terms and conditions are governed by and construed in accordance with the laws and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
