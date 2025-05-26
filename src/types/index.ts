// Types from PriceChart.tsx
export interface HisData {
  date: string;
  close: number;
  pct: number;
}

export interface DataZoomEventParamsDetail {
  start?: number;
  end?: number;
  dataZoomId?: string;
}

export interface DataZoomEventParams {
  type?: 'datazoom';
  start?: number;
  end?: number;
  batch?: DataZoomEventParamsDetail[];
}

export interface PriceChartProps {
  calFormStartDate: string;
  calFormEndDate: string;
  onDatesChange: (startDate: string, endDate: string) => void;
}

// Types from InvestmentForm.tsx
export interface MonthlyBreakdownItem {
  date: string;
  initialInvestmentAmount: string;
  initialInvestmentReturn: string;
  monthlyInvestmentAmount: string;
  monthlyInvestmentReturn: string;
  dividendAmount: string;
  dividendReturn: string;
}

export interface CalApiParams {
  start_date: string;
  end_date: string;
  initial_investment: string;
  monthly_investment_date: string;
  monthly_investment_amount: string;
}

export interface CalApiResponseData {
  nominalPriceReturn: string;
  annualizedPriceReturn: string;
  nominalPriceReturnWithDividends: string;
  annualizedPriceReturnWithDividends: string;
  totalInvested: string;
  nominalTotalReturnWithoutDividends: string;
  annualizedTotalReturnWithoutDividends: string;
  investmentGrewToPrice: string;
  nominalTotalReturn: string;
  annualizedTotalReturn: string;
  investmentGrewToTotalReturn: string;
  monthlyBreakdown: MonthlyBreakdownItem[];
}

export interface InvestmentFormProps {
  initialFormParams: CalApiParams;
  onFormSubmit: (params: CalApiParams) => Promise<void>;
  apiResult: CalApiResponseData | null;
  apiLoading: boolean;
  apiError: string | null;
  onDateChangeInForm: (name: 'start_date' | 'end_date', date: string) => void;
}