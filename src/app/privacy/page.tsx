import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Understand how your data is handled on the QQQ Investment Calculator. We do not store any personal information.',
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
      <p className="mb-4">
        Your privacy is critically important to us. This website is designed as a simple, anonymous financial calculator.
      </p>
      
      <h2 className="text-2xl font-bold mt-8 mb-4">No Personal Data is Collected</h2>
      <p className="mb-4">
        We do not collect, store, or share any personally identifiable information (PII). All the data you enter for calculations—such as investment amounts and date ranges—is used only for the immediate purpose of performing that calculation.
      </p>
      <p className="mb-4">
        The calculations are processed, and the results are returned to you. None of this information is logged or saved on our servers.
      </p>

      <h2 className="text-2xl font-bold mt-8 mb-4">Third-Party Services & Cookies</h2>
      <p className="mb-4">
        To support this free tool, we use third-party services like Google Analytics and Google AdSense. These services may use cookies to gather anonymous usage data and to serve relevant advertisements. This data helps us understand how our site is used and allows us to keep it running.
      </p>
      <p className="mb-4">
        We do not have access to the specific information collected by these third-party services. For more details on how Google uses this data, please refer to <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Google&apos;s Privacy & Terms</a>.
      </p>

      <h2 className="text-2xl font-bold mt-8 mb-4">Changes to This Policy</h2>
      <p className="mb-4">
        We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.
      </p>

      <h2 className="text-2xl font-bold mt-8 mb-4">Contact Us</h2>
      <p className="mb-4">
        If you have any questions about this Privacy Policy, please <a href="/contact" className="text-blue-500 hover:underline">contact us</a>.
      </p>
    </div>
  );
}