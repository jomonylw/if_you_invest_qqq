"use client";
import { useState, useEffect } from "react";
// Typography, CircularProgress, Alert removed as they are handled by InvestmentForm
import InvestmentForm from '@/components/InvestmentForm'; // Import new component
import LoadingSpinner from '@/components/LoadingSpinner'; // Import loading spinner component
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
    <div className="container mx-auto p-4">
      {/* <h1 className="text-2xl font-bold mb-4 text-center">QQQ Investment Calculator</h1> */}
      <h1 className="text-3xl font-bold text-center my-6 text-blue-600 flex items-center justify-center gap-2">
        <span className="animate-pulse">📈</span>
        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          If You Invest QQQ
        </span>
        <span className="animate-bounce">💰</span>
      </h1>

      <InvestmentForm
        initialFormParams={calFormParams}
        onFormSubmit={handleCalFormSubmit}
        apiResult={calApiResult}
        apiLoading={calApiLoading}
        apiError={calApiError}
        onDateChangeInForm={handleDateChangeInPage}
      />
      {calApiLoading && <LoadingSpinner />}
    </div>
    </LocalizationProvider>
  );
}
