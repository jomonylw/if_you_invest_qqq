"use client";
import { Card, CardContent, Typography, Grid } from '@mui/material';
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
    return `$${parseFloat(value).toFixed(2)}`;
  };

  const chartOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        crossStyle: {
          color: '#999'
        }
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
          formatter: '${value}'
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
          color: '#91CC75' // Color 1 - similar
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
          color: '#FAC858' // Color 2
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
          color: '#EE6666' // Color 2 - similar
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
          color: '#73C0DE' // Color 3
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
          color: '#3BA272' // Color 3 - similar
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
        <Typography variant="h6" gutterBottom>Calculation Results:</Typography>
        <Grid container spacing={2} className="mb-4" direction="column">
          {/* Price Returns Group */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>Price Returns</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2">Nominal Price Return:</Typography>
                <Typography variant="h6">{formatPercentage(nominalPriceReturn)}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2">Annualized Price Return:</Typography>
                <Typography variant="h6">{formatPercentage(annualizedPriceReturn)}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2">Nominal Price Return (w/ Dividends):</Typography>
                <Typography variant="h6">{formatPercentage(nominalPriceReturnWithDividends)}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2">Annualized Price Return (w/ Dividends):</Typography>
                <Typography variant="h6">{formatPercentage(annualizedPriceReturnWithDividends)}</Typography>
              </Grid>
            </Grid>
          </Grid>

          {/* Total Invested Group - 单独一行 */}
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>Investment Summary</Typography>
            <Grid container>
                <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="body2">Total Invested:</Typography>
                    <Typography variant="h6">{formatCurrency(totalInvested)}</Typography>
                </Grid>
            </Grid>
          </Grid>

          {/* Total Returns Group (Without Dividends) */}
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>Growth (Excluding Dividends)</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body2">Nominal Total Return (w/o Dividends):</Typography>
                <Typography variant="h6">{formatPercentage(nominalTotalReturnWithoutDividends)}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body2">Annualized Total Return (w/o Dividends):</Typography>
                <Typography variant="h6">{formatPercentage(annualizedTotalReturnWithoutDividends)}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body2">Investment Grew To:</Typography>
                <Typography variant="h6">{formatCurrency(investmentGrewToPrice)}</Typography>
              </Grid>
            </Grid>
          </Grid>

          {/* Total Returns Group (With Dividends) */}
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>Growth (Including Dividends)</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body2">Nominal Total Return:</Typography>
                <Typography variant="h6">{formatPercentage(nominalTotalReturn)}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body2">Annualized Total Return:</Typography>
                <Typography variant="h6">{formatPercentage(annualizedTotalReturn)}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body2">Investment Grew To:</Typography>
                <Typography variant="h6">{formatCurrency(investmentGrewToTotalReturn)}</Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Typography variant="h6" gutterBottom className="mt-4">Monthly Breakdown Chart:</Typography>
        <ReactECharts option={chartOption} style={{ height: 400 }} />
      </CardContent>
    </Card>
  );
}