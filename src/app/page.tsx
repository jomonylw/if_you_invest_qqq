"use client";
import Image from "next/image";
import ReactECharts from 'echarts-for-react';
import { useEffect, useState, useCallback } from "react";
import type { EChartsOption, DataZoomComponentOption } from 'echarts';
import { TextField, Button, Card, CardContent, Typography, CircularProgress, Alert } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format, parseISO, lastDayOfMonth, subMonths, isLastDayOfMonth } from 'date-fns';

interface HisData {
  date: string;
  close: number;
  pct: number;
}

interface MonthlyBreakdownItem {
  date: string;
  initialInvestmentAmount: string;
  initialInvestmentReturn: string;
  monthlyInvestmentAmount: string;
  monthlyInvestmentReturn: string;
  dividendAmount: string;
  dividendReturn: string;
  // totalInvestedCapital: string; // Uncomment if these are part of your API response
  // totalReturn: string;
  // totalValueWithoutDividends: string;
  // totalValue: string;
}

interface CalApiParams {
  start_date: string;
  end_date: string;
  initial_investment: string;
  monthly_investment_date: string;
  monthly_investment_amount: string;
}

interface CalApiResponseData {
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


export default function Home() {
  const [chartOption, setChartOption] = useState<EChartsOption | null>(null);
  const [allDates, setAllDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [calFormParams, setCalFormParams] = useState<CalApiParams>({
    start_date: '2020-01-01',
    end_date: '2023-12-31',
    initial_investment: '10000',
    monthly_investment_date: '1',
    monthly_investment_amount: '1000',
  });
  const [calApiResult, setCalApiResult] = useState<CalApiResponseData | null>(null);
  const [calApiLoading, setCalApiLoading] = useState(false);
  const [calApiError, setCalApiError] = useState<string | null>(null);


  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/his');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (result.success && result.data) {
          const data: HisData[] = result.data;
          const localDates = data.map(item => item.date);
          setAllDates(localDates);
          const closes = data.map(item => item.close);
          const pcts = data.map(item => ({
            value: item.pct,
            itemStyle: {
              color: item.pct >= 0 ? '#00ff00' : '#ff0000' // Green for positive, Red for negative
            }
          }));

// Calculate min and max for Pct Y-axis
          let minPctValue = Infinity;
          let maxPctValue = -Infinity;
          if (pcts.length > 0) {
            pcts.forEach(p => {
              if (p.value < minPctValue) minPctValue = p.value;
              if (p.value > maxPctValue) maxPctValue = p.value;
            });
          } else {
            // Default values if pcts is empty
            minPctValue = -0.01;
            maxPctValue = 0.01;
          }

          // New logic for symmetrical yMinPct and yMaxPct to center 0%
          let yMinPct, yMaxPct;
          const absoluteMaxPct = Math.max(Math.abs(minPctValue), Math.abs(maxPctValue));

          if (absoluteMaxPct === 0) {
            // Handles case where all pcts are 0 or pcts is empty and defaults led to 0
            yMinPct = -0.01; // Default small range if all values are zero
            yMaxPct = 0.01;
          } else {
            yMaxPct = absoluteMaxPct * 1.1; // Add 10% padding
            yMinPct = -absoluteMaxPct * 1.1; // Add 10% padding, symmetrical
          }

          let initialStartPercent = 0;
          let initialEndPercent = 100;

          if (localDates.length > 0) {
            const initialStartDateIndex = localDates.indexOf(calFormParams.start_date);
            const initialEndDateIndex = localDates.indexOf(calFormParams.end_date);

            if (initialStartDateIndex !== -1 && initialEndDateIndex !== -1 && initialStartDateIndex <= initialEndDateIndex) {
              if (localDates.length > 1) {
                initialStartPercent = (initialStartDateIndex / (localDates.length - 1)) * 100;
                initialEndPercent = (initialEndDateIndex / (localDates.length - 1)) * 100;
              } else { // localDates.length === 1
                initialStartPercent = 0;
                initialEndPercent = 100;
              }
            }
          }
          initialStartPercent = Math.max(0, Math.min(100, initialStartPercent));
          initialEndPercent = Math.max(0, Math.min(100, initialEndPercent));
          if (initialStartPercent > initialEndPercent) {
            initialEndPercent = initialStartPercent;
          }

          setChartOption({
            tooltip: {
              trigger: 'axis',
              axisPointer: {
                type: 'cross',
                crossStyle: {
                  color: '#999'
                }
              }
            },
            toolbox: {
              show: false, // Hide the toolbox
              feature: {
                dataView: { show: true, readOnly: false },
                magicType: { show: true, type: ['line', 'bar'] },
                restore: { show: true },
                saveAsImage: { show: true }
              }
            },
            legend: {
              data: ['Close Price', 'Change Percent']
            },
            dataZoom: [
              {
                type: 'slider',
                show: true,
                xAxisIndex: [0],
                start: initialStartPercent,
                end: initialEndPercent,
                bottom: 10, // 距离底部的距离
realtime: false
              },
              {
                type: 'inside',
                xAxisIndex: [0],
                start: initialStartPercent,
                end: initialEndPercent,
              }
            ],
            xAxis: [
              {
                type: 'category',
                data: localDates,
                axisPointer: {
                  type: 'shadow'
                }
              }
            ],
            yAxis: [
              {
                type: 'value',
                name: 'Price',
                min: function (value: { min: number; }) {
                    return Math.floor(value.min * 0.95);
                },
                max: function (value: { max: number; }) {
                    return Math.ceil(value.max * 1.05);
                },
                axisLabel: {
                  formatter: '${value}'
                },
                axisPointer: {
                  label: {
                    formatter: function (params: { value: number | string | Date }) {
                      let numericValue: number | undefined;
                      if (typeof params.value === 'number') {
                        numericValue = params.value;
                      } else if (typeof params.value === 'string') {
                        const parsed = parseFloat(params.value);
                        if (!isNaN(parsed)) {
                          numericValue = parsed;
                        }
                      }
                      // For 'Price' axis, we expect a number.
                      if (numericValue !== undefined) {
                        return '$ ' + numericValue.toFixed(2);
                      }
                      return String(params.value); // Fallback
                    }
                  }
                }
              },
              {
                type: 'value',
                name: 'Change Percent',
                alignTicks: true,
                min: yMinPct,
                max: yMaxPct,
                axisLabel: {
                  formatter: function (value: number) {
                    return (value * 100).toFixed(2) + ' %';
                  }
                },
                axisPointer: {
                  label: {
                    formatter: function (params: { value: number | string | Date }) {
                      let numericValue: number | undefined;
                      if (typeof params.value === 'number') {
                        numericValue = params.value;
                      } else if (typeof params.value === 'string') {
                        const parsed = parseFloat(params.value);
                        if (!isNaN(parsed)) {
                          numericValue = parsed;
                        }
                      }
                      // For 'Change Percent' axis, we expect a number.
                      // Date type is included for type compatibility but shouldn't occur for this specific axis.
                      if (numericValue !== undefined) {
                        return (numericValue * 100).toFixed(2) + ' %';
                      }
                      return String(params.value); // Fallback
                    }
                  }
                },
                splitLine: { // Ensure 0% grid line is visible if it's a tick
                  show: true
                }
              }
            ],
            series: [
              {
                name: 'Close Price',
                type: 'line',
                smooth: true,
                yAxisIndex: 0,
                tooltip: {
                  valueFormatter: function (value: (string | number | Date | null | undefined) | (string | number | Date | null | undefined)[]) {
                    if (value === undefined || value === null) return '';
                    
                    if (Array.isArray(value)) {
                        if (value.length > 1 && typeof value[1] === 'number') {
                            return '$' + value[1].toFixed(2);
                        }
                        // Ensure all elements are converted to string before join
                        return value.map(v => String(v)).join(', ');
                    }
                    if (value instanceof Date) {
                        return value.toLocaleString();
                    }
                    if (typeof value === 'number') {
                      return '$' + value.toFixed(2);
                    }
                    return String(value);
                  }
                },
                data: closes
              },
              {
                name: 'Change Percent',
                type: 'bar',
                yAxisIndex: 1,
                tooltip: {
                  valueFormatter: function (value: (string | number | Date | null | undefined) | (string | number | Date | null | undefined)[]) {
                    if (value === undefined || value === null) return '';

                    if (Array.isArray(value)) {
                        if (value.length > 0 && typeof value[0] === 'number') {
                            return (value[0] * 100).toFixed(2) + ' %';
                        }
                        return value.map(v => String(v)).join(', ');
                    }
                     if (value instanceof Date) {
                        return value.toLocaleString();
                    }
                    if (typeof value === 'number') {
                      return (value * 100).toFixed(2) + ' %';
                    }
                    return String(value);
                  }
                },
                data: pcts
              }
            ]
          });
        } else {
          throw new Error(result.err || 'Failed to fetch data');
        }
      } catch (e) {
        console.error("Failed to fetch or process data:", e);
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [calFormParams.start_date, calFormParams.end_date]); // Add dependencies to re-init chart if these change before data load

  const handleCalFormChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setCalFormParams(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name: string, newValue: Date | null) => {
    if (newValue) {
      setCalFormParams(prev => ({ ...prev, [name]: format(newValue, 'yyyy-MM-dd') }));
    } else {
      // Handle case where date is cleared, perhaps set to an empty string or a default
      setCalFormParams(prev => ({ ...prev, [name]: '' })); // Or some other logic
    }
  };

  const handleCalFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCalApiLoading(true);
    setCalApiError(null);
    setCalApiResult(null);

    const queryParams = new URLSearchParams({
        start_date: calFormParams.start_date,
        end_date: calFormParams.end_date,
        initial_investment: calFormParams.initial_investment,
        monthly_investment_date: calFormParams.monthly_investment_date,
        monthly_investment_amount: calFormParams.monthly_investment_amount,
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

interface DataZoomEventParamsDetail {
  start?: number;
  end?: number;
  dataZoomId?: string;
}

interface DataZoomEventParams {
  type?: 'datazoom'; // ECharts events usually have a type
  start?: number;
  end?: number;
  batch?: DataZoomEventParamsDetail[];
}

const handleDataZoom = useCallback((params: DataZoomEventParams) => {
  if (allDates.length > 0 && params) {
    let eventDetailSource: DataZoomEventParamsDetail | null = null;

    if (params.batch && params.batch.length > 0 && params.batch[0]) {
      eventDetailSource = params.batch[0];
    } else if (typeof params.start === 'number' && typeof params.end === 'number') {
      eventDetailSource = params as DataZoomEventParamsDetail; // params itself has start/end
    }

    if (eventDetailSource && typeof eventDetailSource.start === 'number' && typeof eventDetailSource.end === 'number') {
      const startPercent = eventDetailSource.start;
      const endPercent = eventDetailSource.end;

      const len = allDates.length;
      if (len === 0) return;

      const startIndex = Math.round((startPercent / 100) * (len - 1));
      const endIndex = Math.round((endPercent / 100) * (len - 1));

      // Ensure indices are valid and in correct order
      const validStartIndex = Math.max(0, Math.min(startIndex, len - 1));
        const validEndIndex = Math.max(0, Math.min(endIndex, len - 1));

        if (allDates[validStartIndex] && allDates[validEndIndex] && validStartIndex <= validEndIndex) {
          const newStartDate = allDates[validStartIndex];
          const newEndDate = allDates[validEndIndex];

          if (calFormParams.start_date !== newStartDate || calFormParams.end_date !== newEndDate) {
            setCalFormParams(prev => ({
              ...prev,
              start_date: newStartDate,
              end_date: newEndDate,
            }));
          }
        }
      }
    }
  }, [allDates, calFormParams.start_date, calFormParams.end_date]);

  useEffect(() => {
    if (allDates.length > 0 && chartOption) {
      let effectiveZoomStartDateStr: string | undefined = undefined;
      let effectiveZoomEndDateStr: string | undefined = undefined;

      // Calculate effectiveZoomStartDateStr based on calFormParams.start_date
      if (calFormParams.start_date) {
        try {
          const startDateObj = parseISO(calFormParams.start_date);
          // Target: last day of the month PRIOR to calFormParams.start_date's month
          const prevMonthLastDayObj = lastDayOfMonth(subMonths(startDateObj, 1));
          const targetStart = format(prevMonthLastDayObj, 'yyyy-MM-dd');
          
          for (let i = allDates.length - 1; i >= 0; i--) {
            if (allDates[i] <= targetStart) {
              effectiveZoomStartDateStr = allDates[i];
              break;
            }
          }
          if (!effectiveZoomStartDateStr && allDates.length > 0) {
            effectiveZoomStartDateStr = allDates[0]; // Fallback to the earliest date if no suitable date found
          }
        } catch (e) {
          console.error("Error processing start_date for dataZoom sync:", e);
          if (allDates.length > 0) effectiveZoomStartDateStr = allDates[0]; // Fallback on error
        }
      } else if (allDates.length > 0) {
        effectiveZoomStartDateStr = allDates[0]; // Default if no start_date
      }

      // Calculate effectiveZoomEndDateStr based on calFormParams.end_date
      if (calFormParams.end_date) {
        try {
          const endDateObj = parseISO(calFormParams.end_date);
          // Target: last day of calFormParams.end_date's month
          const currentMonthLastDayObj = lastDayOfMonth(endDateObj);
          const targetEndCurrentMonth = format(currentMonthLastDayObj, 'yyyy-MM-dd');

          if (allDates.includes(targetEndCurrentMonth)) {
            effectiveZoomEndDateStr = targetEndCurrentMonth;
          } else {
            // Find the latest month-end in allDates that is <= calFormParams.end_date
            for (let i = allDates.length - 1; i >= 0; i--) {
              if (allDates[i] <= calFormParams.end_date) {
                const d = parseISO(allDates[i]);
                if (isLastDayOfMonth(d)) {
                  effectiveZoomEndDateStr = allDates[i];
                  break;
                }
              }
            }
            // Fallback if no suitable month-end found, use the latest date in allDates <= calFormParams.end_date
            if (!effectiveZoomEndDateStr) {
              for (let i = allDates.length - 1; i >= 0; i--) {
                if (allDates[i] <= calFormParams.end_date) {
                  effectiveZoomEndDateStr = allDates[i];
                  break;
                }
              }
            }
          }
          if (!effectiveZoomEndDateStr && allDates.length > 0) { // Further fallback
             effectiveZoomEndDateStr = allDates[allDates.length -1];
          }
        } catch (e) {
          console.error("Error processing end_date for dataZoom sync:", e);
          if (allDates.length > 0) effectiveZoomEndDateStr = allDates[allDates.length - 1]; // Fallback on error
        }
      } else if (allDates.length > 0) {
        effectiveZoomEndDateStr = allDates[allDates.length - 1]; // Default if no end_date
      }
      
      // Ensure fallbacks if strings are still undefined
      if (!effectiveZoomStartDateStr && allDates.length > 0) effectiveZoomStartDateStr = allDates[0];
      if (!effectiveZoomEndDateStr && allDates.length > 0) effectiveZoomEndDateStr = allDates[allDates.length - 1];

      if (effectiveZoomStartDateStr && effectiveZoomEndDateStr) {
        const startDateIndex = allDates.indexOf(effectiveZoomStartDateStr);
        const endDateIndex = allDates.indexOf(effectiveZoomEndDateStr);

        if (startDateIndex !== -1 && endDateIndex !== -1 && startDateIndex <= endDateIndex) {
          let newStartPercent: number;
          let newEndPercent: number;

          if (allDates.length > 1) {
            newStartPercent = (startDateIndex / (allDates.length - 1)) * 100;
            newEndPercent = (endDateIndex / (allDates.length - 1)) * 100;
          } else { // allDates.length === 1
            newStartPercent = 0;
            newEndPercent = 100;
          }

          newStartPercent = Math.max(0, Math.min(100, newStartPercent));
          newEndPercent = Math.max(0, Math.min(100, newEndPercent));
          if (newStartPercent > newEndPercent) newEndPercent = newStartPercent;
          
          // Now, update the chart option if the zoom percentages have changed
          setChartOption(prevOption => {
            if (!prevOption || !prevOption.dataZoom) return prevOption;

            const dataZoomConfig = prevOption.dataZoom;
            const dataZoomArray: DataZoomComponentOption[] = Array.isArray(dataZoomConfig)
              ? dataZoomConfig
              : [dataZoomConfig];

            if (dataZoomArray.length === 0) return prevOption;
            
            const currentSliderZoom = dataZoomArray[0];
            const currentInsideZoom = dataZoomArray.length > 1 ? dataZoomArray[1] : undefined;

            let changed = false;
            if (currentSliderZoom && typeof currentSliderZoom.start === 'number' && typeof currentSliderZoom.end === 'number') {
              if (Math.abs(currentSliderZoom.start - newStartPercent) > 0.01 || Math.abs(currentSliderZoom.end - newEndPercent) > 0.01) {
                changed = true;
              }
            }
            
            if (!changed && currentInsideZoom && typeof currentInsideZoom.start === 'number' && typeof currentInsideZoom.end === 'number') {
               if (Math.abs(currentInsideZoom.start - newStartPercent) > 0.01 || Math.abs(currentInsideZoom.end - newEndPercent) > 0.01 ) {
                  changed = true;
              }
            }

            if (!changed) {
              return prevOption; // No significant change, return previous option
            }
            
            const newOptionDataZoom = dataZoomArray.map((zoomItem: DataZoomComponentOption) => ({
              ...zoomItem,
              start: newStartPercent,
              end: newEndPercent,
            }));

            return {
              ...prevOption,
              dataZoom: newOptionDataZoom,
            };
          });
        }
      }
    }
  }, [calFormParams.start_date, calFormParams.end_date, allDates, chartOption, setChartOption]);

  const onEvents = {
    'datazoom': handleDataZoom,
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading chart data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        Error loading chart: {error}
      </div>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">QQQ Investment Calculator</h1>
      
      

      <h2 className="text-xl font-semibold mb-4 text-center">QQQ Historical Price Data</h2>
      {chartOption && (
        <ReactECharts
          option={chartOption}
          style={{ height: '600px', width: '100%' }}
          notMerge={true}
          lazyUpdate={true}
          onEvents={onEvents}
        />
      )}
      <Card className="mb-8">
        <CardContent>
          <Typography variant="h5" component="div" gutterBottom>
            Calculate Investment Growth
          </Typography>
          <form onSubmit={handleCalFormSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <DatePicker
                label="Start Date"
                value={calFormParams.start_date ? parseISO(calFormParams.start_date) : null}
                onAccept={(newValue) => handleDateChange('start_date', newValue)}
                format="yyyy-MM-dd"
                slotProps={{ textField: { fullWidth: true, required: true, name: "start_date", inputProps: { readOnly: true } } }}
              />
              <DatePicker
                label="End Date"
                value={calFormParams.end_date ? parseISO(calFormParams.end_date) : null}
                onAccept={(newValue) => handleDateChange('end_date', newValue)}
                format="yyyy-MM-dd"
                slotProps={{ textField: { fullWidth: true, required: true, name: "end_date", inputProps: { readOnly: true } } }}
              />
              <TextField
                label="Initial Investment ($)"
                name="initial_investment"
                type="number"
                value={calFormParams.initial_investment}
                onChange={handleCalFormChange}
                fullWidth
                required
              />
              <TextField
                label="Monthly Investment Date (1-31)"
                name="monthly_investment_date"
                type="number"
                value={calFormParams.monthly_investment_date}
                onChange={handleCalFormChange}
                fullWidth
                required
                inputProps={{ min: 1, max: 31 }}
              />
              <TextField
                label="Monthly Investment Amount ($)"
                name="monthly_investment_amount"
                type="number"
                value={calFormParams.monthly_investment_amount}
                onChange={handleCalFormChange}
                fullWidth
                required
              />
            </div>
            <Button type="submit" variant="contained" color="primary" disabled={calApiLoading}>
              {calApiLoading ? <CircularProgress size={24} /> : 'Calculate'}
            </Button>
          </form>

          {calApiLoading && <Typography className="mt-4">Calculating...</Typography>}
          {calApiError && <Alert severity="error" className="mt-4">Error: {calApiError}</Alert>}
          {calApiResult && (
            <Card className="mt-6">
              <CardContent>
                <Typography variant="h6" gutterBottom>Calculation Results:</Typography>
                <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
                  {JSON.stringify(calApiResult, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
       <footer className="mt-8 text-center text-sm text-gray-500">
        <p>Historical data fetched from /api/his. Calculation via /api/cal.</p>
        <div className="flex gap-4 items-center justify-center mt-4 flex-col sm:flex-row">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            Deploy now
          </a>
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read our docs
          </a>
        </div>
      </footer>
    </div>
    </LocalizationProvider>
  );
}
