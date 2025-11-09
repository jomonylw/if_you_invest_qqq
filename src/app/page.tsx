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
      </footer>
    </div>
    </LocalizationProvider>
  );
}

