
import { PageHeader } from "@/components/ui/page-header";

export const metadata = {
  title: "Privacy Policy | BioinformaticsHub",
  description: "Privacy Policy and data protection practices for BioinformaticsHub.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen pb-20">
      <PageHeader 
        title="Privacy Policy"
        subtitle="Last updated: January 2026"
        backgroundImage="https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=1600&auto=format&fit=crop&q=80"
      />

      <div className="container mx-auto px-4 -mt-10 relative z-10">
        <div className="max-w-4xl mx-auto glass-card p-8 md:p-12 rounded-3xl shadow-xl">
          <div className="prose dark:prose-invert prose-lg max-w-none">
            <p className="lead">
              At BioinformaticsHub.io, accessible from https://bioinformaticshub.io, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by BioinformaticsHub.io and how we use it.
            </p>

            <h3>1. Information We Collect</h3>
            <p>
              We collect information that you voluntarily provide to us when you register on the website, express an interest in obtaining information about us or our products and services, when you participate in activities on the website, or otherwise when you contact us.
            </p>
            <ul>
              <li><strong>Personal Data:</strong> Name, email address, and other contact details.</li>
              <li><strong>Usage Data:</strong> Information on how the Service is accessed and used.</li>
            </ul>

            <h3>2. How We Use Your Information</h3>
            <p>
              We use the information we collect in various ways, including to:
            </p>
            <ul>
              <li>Provide, operate, and maintain our website</li>
              <li>Improve, personalize, and expand our website</li>
              <li>Understand and analyze how you use our website</li>
              <li>Develop new products, services, features, and functionality</li>
              <li>Communicate with you to provide updates and other information relating to the website</li>
              <li>Send you emails (e.g. newsletter)</li>
              <li>Find and prevent fraud</li>
            </ul>

            <h3>3. Cookies and Web Beacons</h3>
            <p>
              Like any other website, BioinformaticsHub.io uses &apos;cookies&apos;. These cookies are used to store information including visitors&apos; preferences, and the pages on the website that the visitor accessed or visited. The information is used to optimize the users&apos; experience by customizing our web page content based on visitors&apos; browser type and/or other information.
            </p>

            <h3>4. Third Party Privacy Policies</h3>
            <p>
              BioinformaticsHub.io&apos;s Privacy Policy does not apply to other advertisers or websites. Thus, we are advising you to consult the respective Privacy Policies of these third-party ad servers for more detailed information. It may include their practices and instructions about how to opt-out of certain options.
            </p>

            <h3>5. Data Security</h3>
            <p>
              We value your trust in providing us your Personal Information, thus we are striving to use commercially acceptable means of protecting it. But remember that no method of transmission over the internet, or method of electronic storage is 100% secure and reliable, and we cannot guarantee its absolute security.
            </p>

            <h3>6. Children&apos;s Information</h3>
            <p>
              Another part of our priority is adding protection for children while using the internet. We encourage parents and guardians to observe, participate in, and/or monitor and guide their online activity. BioinformaticsHub.io does not knowingly collect any Personal Identifiable Information from children under the age of 13.
            </p>

            <h3>7. Changes to This Privacy Policy</h3>
            <p>
              We may update our Privacy Policy from time to time. Thus, we advise you to review this page periodically for any changes. We will notify you of any changes by posting the new Privacy Policy on this page. These changes are effective immediately, after they are posted on this page.
            </p>

            <h3>8. Contact Us</h3>
            <p>
              If you have any questions or suggestions about our Privacy Policy, do not hesitate to contact us.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
