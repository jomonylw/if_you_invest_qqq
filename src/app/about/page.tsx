import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn more about the QQQ Investment Calculator and our mission to provide powerful, easy-to-use financial tools.',
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">About Us</h1>
      <p className="mb-4">
        Welcome to the QQQ Investment Calculator, your trusted partner in navigating the complexities of the stock market. Our mission is to empower investors of all levels with intuitive, data-driven tools that make financial analysis accessible and straightforward.
      </p>
      <p className="mb-4">
        This platform was born from a simple idea: to provide a clear and concise way to visualize the potential growth of an investment in the Invesco QQQ Trust (QQQ). We believe that with the right tools, anyone can make informed decisions to build long-term wealth.
      </p>
      <p className="mb-4">
        Our calculator is meticulously designed to be both powerful and user-friendly. By leveraging historical data, we offer a glimpse into how a systematic investment strategy could have performed over time, helping you understand the power of compounding and consistent investing.
      </p>
      <h2 className="text-2xl font-bold mt-8 mb-4">Our Commitment</h2>
      <p>
        We are committed to providing a high-quality, reliable, and transparent service. We continuously work to improve our tools and add new features to meet the evolving needs of our users. Your financial journey is important to us, and we are here to support you every step of the way.
      </p>
    </div>
  );
}