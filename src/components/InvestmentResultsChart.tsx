"use client";
import { Card, CardContent, Typography } from '@mui/material';
import ReactECharts from 'echarts-for-react';
import type { InvestmentResultsChartProps, MonthlyBreakdownItem } from '../types';

export default function InvestmentResultsChart({ results }: InvestmentResultsChartProps) {
  const {
    nominalPriceReturn,
    annualizedPriceReturn,
    nominalPriceReturnWithDividends,
    annualizedPriceReturnWithDividends,
    totalInvested,
    nominalTotalReturnWithoutDividends,
    annualizedTotalReturnWithoutDividends,
    investmentGrewToPrice,
    nominalTotalReturn,
    annualizedTotalReturn,
    investmentGrewToTotalReturn,
    monthlyBreakdown,
  } = results;

  const formatPercentage = (value: string) => {
    return `${(parseFloat(value) * 100).toFixed(2)}%`;
  };

  const formatCurrency = (value: string) => {
    const num = parseFloat(value);
    return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const chartOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        crossStyle: {
          color: '#999'
        }
      },
      formatter: function (params: { name: string; marker: string; seriesName: string; value: string | number }[]) {
        let result = params[0].name + '<br/>';
        params.forEach(function (item: { marker: string; seriesName: string; value: string | number }) {
          const val = parseFloat(String(item.value));
          result += item.marker + item.seriesName + ': $' + val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '<br/>';
        });
        return result;
      }
    },
    legend: {
      data: [
        'Initial Investment Amount',
        'Initial Investment Return',
        'Monthly Investment Amount',
        'Monthly Investment Return',
        'Dividend Amount',
        'Dividend Return'
      ]
    },
    xAxis: [
      {
        type: 'category',
        data: monthlyBreakdown.map((item: MonthlyBreakdownItem) => item.date),
        axisPointer: {
          type: 'shadow'
        }
      }
    ],
    yAxis: [
      {
        type: 'value',
        name: 'Amount', // Changed name for clarity
        axisLabel: {
          formatter: (value: number) => `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        },
        axisPointer: {
          label: {
            formatter: function (params: { value: number }) {
              return `$${params.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            }
          }
        }
      }
    ],
    series: [
      {
        name: 'Initial Investment Amount',
        type: 'bar',
        stack: 'total',
        itemStyle: {
          color: '#5470C6' // Color 1
        },
        emphasis: {
          focus: 'series'
        },
        data: monthlyBreakdown.map((item: MonthlyBreakdownItem) => parseFloat(item.initialInvestmentAmount))
      },
      {
        name: 'Initial Investment Return',
        type: 'bar',
        stack: 'total',
        itemStyle: {
          color: 'rgba(84, 112, 198, 0.5)' // Color 1 (70% transparent)
        },
        emphasis: {
          focus: 'series'
        },
        data: monthlyBreakdown.map((item: MonthlyBreakdownItem) => parseFloat(item.initialInvestmentReturn))
      },
      {
        name: 'Monthly Investment Amount',
        type: 'bar',
        stack: 'total',
        itemStyle: {
          color: '#91CC75' // Color 2
        },
        emphasis: {
          focus: 'series'
        },
        data: monthlyBreakdown.map((item: MonthlyBreakdownItem) => parseFloat(item.monthlyInvestmentAmount))
      },
      {
        name: 'Monthly Investment Return',
        type: 'bar',
        stack: 'total',
        itemStyle: {
          color: 'rgba(145, 204, 117, 0.5)' // Color 2 (70% transparent)
        },
        emphasis: {
          focus: 'series'
        },
        data: monthlyBreakdown.map((item: MonthlyBreakdownItem) => parseFloat(item.monthlyInvestmentReturn))
      },
      {
        name: 'Dividend Amount',
        type: 'bar',
        stack: 'total',
        itemStyle: {
          color: '#FAC858' // Color 3
        },
        emphasis: {
          focus: 'series'
        },
        data: monthlyBreakdown.map((item: MonthlyBreakdownItem) => parseFloat(item.dividendAmount))
      },
      {
        name: 'Dividend Return',
        type: 'bar',
        stack: 'total',
        itemStyle: {
          color: 'rgba(250, 200, 88, 0.5)' // Color 3 (70% transparent)
        },
        emphasis: {
          focus: 'series'
        },
        data: monthlyBreakdown.map((item: MonthlyBreakdownItem) => parseFloat(item.dividendReturn))
      }
    ]
  };

  return (
    <Card className="mt-6">
      <CardContent>
        <h2 className="text-xl font-semibold mb-4 text-center pt-5">Calculation Results</h2>
        <div className="flex flex-col gap-4 mb-4"> {/* Main container. spacing={2} -> gap-4 (16px), direction="column" -> flex-col */}
          {/* Price Returns Group */}
          <div className="w-full"> {/* Corresponds to Grid item xs={12} */}
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>Price Returns</Typography>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4"> {/* container spacing={2} -> gap-4. md={3} items -> 2x2 grid */}
              <div> {/* item xs={12} sm={6} md={3} */}
                <Typography variant="body2">Nominal Price Return:</Typography>
                <Typography variant="h6">{formatPercentage(nominalPriceReturn)}</Typography>
              </div>
              <div> {/* item xs={12} sm={6} md={3} */}
                <Typography variant="body2">Annualized Price Return:</Typography>
                <Typography variant="h6">{formatPercentage(annualizedPriceReturn)}</Typography>
              </div>
              <div> {/* item xs={12} sm={6} md={3} */}
                <Typography variant="body2">
                  Nominal Price Return <br />
                  (Including Dividends)
                </Typography>
                <Typography variant="h6">{formatPercentage(nominalPriceReturnWithDividends)}</Typography>
              </div>
              <div> {/* item xs={12} sm={6} md={3} */}
                <Typography variant="body2">
                  Annualized Price Return <br />
                  (Including Dividends)
                </Typography>
                <Typography variant="h6">{formatPercentage(annualizedPriceReturnWithDividends)}</Typography>
              </div>
            </div>
          </div>

          {/* Total Invested Group - 单独一行 */}
          <div className="w-full mt-4"> {/* item xs={12}, sx={{ mt: 2 }} -> mt-4 */}
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>Investment Summary</Typography>
            <div> {/* Replaces <Grid container> for single item layout */}
                <div className="w-full sm:w-1/2 md:w-1/3"> {/* Replaces <Grid item xs={12} sm={6} md={4}> */}
                    <Typography variant="body2">Total Invested:</Typography>
                    <Typography variant="h6">{formatCurrency(totalInvested)}</Typography>
                </div>
            </div>
          </div>

          {/* Total Returns Group (Without Dividends) */}
          <div className="w-full mt-4"> {/* item xs={12}, sx={{ mt: 2 }} -> mt-4 */}
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>Growth (Excluding Dividends)</Typography>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"> {/* container spacing={2} -> gap-4. md={4} items -> 3 cols */}
              <div> {/* item xs={12} sm={6} md={4} */}
                <Typography variant="body2">Nominal Total Return:</Typography>
                <Typography variant="h6">{formatPercentage(nominalTotalReturnWithoutDividends)}</Typography>
              </div>
              <div> {/* item xs={12} sm={6} md={4} */}
                <Typography variant="body2">Annualized Total Return:</Typography>
                <Typography variant="h6">{formatPercentage(annualizedTotalReturnWithoutDividends)}</Typography>
              </div>
              <div> {/* item xs={12} sm={6} md={4} */}
                <Typography variant="body2">Investment Grew To:</Typography>
                <Typography variant="h6">{formatCurrency(investmentGrewToPrice)}</Typography>
              </div>
            </div>
          </div>

          {/* Total Returns Group (With Dividends) */}
          <div className="w-full mt-4"> {/* item xs={12}, sx={{ mt: 2 }} -> mt-4 */}
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>Growth (Including Dividends)</Typography>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"> {/* container spacing={2} -> gap-4. md={4} items -> 3 cols */}
              <div> {/* item xs={12} sm={6} md={4} */}
                <Typography variant="body2">Nominal Total Return:</Typography>
                <Typography variant="h6">{formatPercentage(nominalTotalReturn)}</Typography>
              </div>
              <div> {/* item xs={12} sm={6} md={4} */}
                <Typography variant="body2">Annualized Total Return:</Typography>
                <Typography variant="h6">{formatPercentage(annualizedTotalReturn)}</Typography>
              </div>
              <div> {/* item xs={12} sm={6} md={4} */}
                <Typography variant="body2">Investment Grew To:</Typography>
                <Typography variant="h6">{formatCurrency(investmentGrewToTotalReturn)}</Typography>
              </div>
            </div>
          </div>
        </div>
        <h2 className="text-xl font-semibold mb-4 text-center pt-5">Monthly Breakdown</h2>
        <ReactECharts option={chartOption} style={{ height: 400 }} />
      </CardContent>
    </Card>
  );
}