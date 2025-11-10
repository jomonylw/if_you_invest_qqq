"use client";
import { useState } from 'react';

export default function HowItWorks() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="mt-12 mb-8">
      <div 
        className="flex items-center justify-center cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h2 className="text-3xl font-bold text-center title-gradient">How It Works</h2>
        <svg 
          className={`w-8 h-8 ml-2 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </div>
      <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isOpen ? 'max-h-screen' : 'max-h-0'}`}>
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6 text-center pt-8">
          
          {/* Step 1 */}
          <div className="glass-effect p-6 rounded-xl border border-white/20 shadow-lg">
            <div className="flex justify-center mb-4">
              <svg className="h-12 w-12 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h3 className="font-bold text-lg mb-2">1. Input Your Strategy</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Enter your initial investment, monthly contribution, and the time frame you&apos;re interested in.
            </p>
          </div>

          {/* Step 2 */}
          <div className="glass-effect p-6 rounded-xl border border-white/20 shadow-lg">
            <div className="flex justify-center mb-4">
              <svg className="h-12 w-12 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="font-bold text-lg mb-2">2. Historical Data Analysis</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              We use historical QQQ price data to model how your investment strategy would have performed.
            </p>
          </div>

          {/* Step 3 */}
          <div className="glass-effect p-6 rounded-xl border border-white/20 shadow-lg">
            <div className="flex justify-center mb-4">
              <svg className="h-12 w-12 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="font-bold text-lg mb-2">3. Visualize Your Growth</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Results are displayed in an easy-to-understand chart, showing your potential investment growth.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}