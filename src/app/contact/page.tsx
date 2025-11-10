import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with the QQQ Investment Calculator team. We welcome your feedback, questions, and suggestions via our GitHub repository.',
};

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">Contact & Feedback</h1>
      <p className="mb-4">
        We&apos;d love to hear from you! If you have a question, find a bug, or have a suggestion for improvement, the best way to reach us is by opening an issue on our GitHub repository.
      </p>
      <div>
        <h2 className="text-2xl font-bold mb-2">GitHub Issues</h2>
        <p className="mb-2">
          Submitting an issue is the most effective way to ensure your feedback is tracked and addressed. This allows for transparent communication and helps us improve the tool for everyone.
        </p>
        <a 
          href="https://github.com/jomonylw/if_you_invest_qqq/issues" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="inline-block bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600 transition-colors"
        >
          Create an Issue on GitHub
        </a>
      </div>
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-2">Why GitHub?</h2>
        <p>
          Using GitHub Issues helps us keep all feedback and bug reports in one centralized place. It allows for public discussion, and you can even track the progress of your suggestion or report. We appreciate your contribution to making this a better tool.
        </p>
      </div>
    </div>
  );
}