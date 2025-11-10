"use client";
import { useState, useEffect } from "react";
// Typography, CircularProgress, Alert removed as they are handled by InvestmentForm
import InvestmentForm from '@/components/InvestmentForm'; // Import new component
// import LoadingSpinner from '@/components/LoadingSpinner'; // Import loading spinner component
import type { CalApiParams, CalApiResponseData } from '@/types'; // Import types
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// Typography import removed as we're using native HTML elements
// DatePicker and format, parseISO are now handled within InvestmentForm or not needed here
import { format, subYears } from 'date-fns';


export default function Home() {
  const today = new Date();
  const defaultEndDate = format(today, 'yyyy-MM-dd');
  const defaultStartDate = format(subYears(today, 5), 'yyyy-MM-dd');

  const [calFormParams, setCalFormParams] = useState<CalApiParams>({
    start_date: defaultStartDate,
    end_date: defaultEndDate,
    initial_investment: '10000',
    monthly_investment_amount: '1000',
  });
  const [calApiResult, setCalApiResult] = useState<CalApiResponseData | null>(null);
  const [calApiLoading, setCalApiLoading] = useState(false);
  const [calApiError, setCalApiError] = useState<string | null>(null);

  // handleCalFormChange is removed as it's handled within InvestmentForm

  // This function now updates the main page's state when dates change in the form
  const handleDateChangeInPage = (name: 'start_date' | 'end_date', dateValue: string) => {
    setCalFormParams(prev => ({ ...prev, [name]: dateValue }));
  };

  const handleCalFormSubmit = async (submittedParams: CalApiParams) => {
    // event.preventDefault(); // Handled within InvestmentForm
    setCalApiLoading(true);
    setCalApiError(null);
    setCalApiResult(null);
    // Update calFormParams to reflect what was submitted from the form
    // This is important if the form's internal state can differ before submission
    setCalFormParams(submittedParams);

    const queryParams = new URLSearchParams({
        start_date: submittedParams.start_date,
        end_date: submittedParams.end_date,
        initial_investment: submittedParams.initial_investment,
        monthly_investment_amount: submittedParams.monthly_investment_amount,
        predicted_annualized_return: submittedParams.predicted_annualized_return || '',
    }).toString();

    try {
      const response = await fetch(`/api/cal?${queryParams}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.err || `HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      if (result.success && result.data) {
        setCalApiResult(result.data);
      } else {
        throw new Error(result.err || 'Failed to fetch calculation data');
      }
    } catch (e) {
      console.error("Failed to fetch or process /api/cal data:", e);
      if (e instanceof Error) {
        setCalApiError(e.message);
      } else {
        setCalApiError("An unknown error occurred while fetching calculation data");
      }
    } finally {
      setCalApiLoading(false);
    }
  };

  // 在页面加载完成后自动触发计算
  useEffect(() => {
    handleCalFormSubmit(calFormParams);
  }, []); // 空依赖数组确保只在组件挂载时运行一次

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
    <div className="container mx-auto p-1 md:p-2">
      {/* Enhanced Header Section */}
      <header className="text-center mb-4 md:mb-6 mt-3 md:mt-4">
        {/* Main Title */}
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold flex items-center justify-center gap-2 mb-2 fade-in title-hover-effect title-mobile-optimize">
          <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl filter drop-shadow-lg">📈</span>
          <span className="title-gradient font-extrabold tracking-tight">
            If You Invest QQQ
          </span>
          <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl filter drop-shadow-lg">💰</span>
        </h1>

        {/* Subtitle */}
        <div className="mx-auto max-w-xl slide-up">
          <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-300 font-medium leading-relaxed">
            <span className="font-semibold">Discover the potential of your QQQ investments</span>
          </p>
        </div>
      </header>

      <InvestmentForm
        initialFormParams={calFormParams}
        onFormSubmit={handleCalFormSubmit}
        apiResult={calApiResult}
        apiLoading={calApiLoading}
        apiError={calApiError}
        onDateChangeInForm={handleDateChangeInPage}
      />

      {/* {calApiLoading && <LoadingSpinner />} */}

      {/* Simple Footer */}
      <footer className="py-3 text-center text-white/70 text-xs mt-4">
        {/* Disclaimer */}
        <p className="text-xs text-white/60 max-w-2xl mx-auto leading-relaxed">
          <span className="inline-block mr-1">⚠️</span>
          <strong>Disclaimer:</strong> This calculator is for educational purposes only. Past performance does not guarantee future results and does not constitute investment advice.</p>
        {/* Copyright */}
        <p className="mt-1">© {new Date().getFullYear()} If You Invest QQQ</p>
        {/* Navigation Links */}
        <div className="mt-2 space-x-4 flex justify-center items-center">
          <a href="/about" className="hover:underline">About</a>
          <a href="/contact" className="hover:underline">Contact</a>
          <a href="/privacy" className="hover:underline">Privacy</a>
          <a href="https://github.com/jomonylw/if_you_invest_qqq" target="_blank" rel="noopener noreferrer" aria-label="GitHub Repository" className="hover:text-gray-400">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.91 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
          </a>
        </div>
      </footer>
    </div>
    </LocalizationProvider>
  );
}
