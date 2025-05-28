"use client";
import React from 'react';
import { Typography } from '@mui/material';
import ReactECharts from 'echarts-for-react';
import CountUp from 'react-countup';
import type { InvestmentResultsChartProps, MonthlyBreakdownItem } from '../types';

export default function InvestmentResultsChart({ results }: InvestmentResultsChartProps) {
  const barChartRef = React.useRef<ReactECharts>(null);
  const pieChartRef = React.useRef<ReactECharts>(null);
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
    title: {
      // text: 'Monthly Investment Breakdown',
      left: 'center',
      top: 10,
      textStyle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333'
      }
    },
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
        'Dividend Return',
        'Total Invested',
        'Total Return'
      ],
      top: 'bottom',
      padding: [50, 0, 0, 0], // 增加顶部内边距，使图例更靠下
      orient: 'horizontal',
      itemGap: 15,
      itemWidth: 20,
      itemHeight: 14,
      textStyle: {
        fontSize: 14,
        overflow: 'truncate',
        width: 120 // 限制文本宽度，防止图例项过长导致多行
      },
      selectedMode: true // 确保图例可以点击选择
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
          color: '#1976D2' // 更现代的蓝色
        },
        emphasis: {
          focus: 'series'
        },
        label: {
          show: false
        },
        data: monthlyBreakdown.map((item: MonthlyBreakdownItem) => parseFloat(item.initialInvestmentAmount))
      },
      {
        name: 'Initial Investment Return',
        type: 'bar',
        stack: 'total',
        itemStyle: {
          color: 'rgba(25, 118, 210, 0.6)' // 更现代的蓝色，半透明
        },
        emphasis: {
          focus: 'series'
        },
        label: {
          show: false
        },
        data: monthlyBreakdown.map((item: MonthlyBreakdownItem) => parseFloat(item.initialInvestmentReturn))
      },
      {
        name: 'Monthly Investment Amount',
        type: 'bar',
        stack: 'total',
        itemStyle: {
          color: '#388E3C' // 更现代的绿色
        },
        emphasis: {
          focus: 'series'
        },
        label: {
          show: false
        },
        data: monthlyBreakdown.map((item: MonthlyBreakdownItem) => parseFloat(item.monthlyInvestmentAmount))
      },
      {
        name: 'Monthly Investment Return',
        type: 'bar',
        stack: 'total',
        itemStyle: {
          color: 'rgba(56, 142, 60, 0.6)' // 更现代的绿色，半透明
        },
        emphasis: {
          focus: 'series'
        },
        label: {
          show: false
        },
        data: monthlyBreakdown.map((item: MonthlyBreakdownItem) => parseFloat(item.monthlyInvestmentReturn))
      },
      {
        name: 'Dividend Amount',
        type: 'bar',
        stack: 'total',
        itemStyle: {
          color: '#F57C00' // 更现代的橙色
        },
        emphasis: {
          focus: 'series'
        },
        label: {
          show: false
        },
        data: monthlyBreakdown.map((item: MonthlyBreakdownItem) => parseFloat(item.dividendAmount))
      },
      {
        name: 'Dividend Return',
        type: 'bar',
        stack: 'total',
        itemStyle: {
          color: 'rgba(245, 124, 0, 0.6)' // 更现代的橙色，半透明
        },
        emphasis: {
          focus: 'series'
        },
        label: {
          show: false
        },
        data: monthlyBreakdown.map((item: MonthlyBreakdownItem) => parseFloat(item.dividendReturn))
      },
      {
        name: 'Total Invested',
        type: 'line',
        yAxisIndex: 0, // 使用左轴
        itemStyle: {
          color: '#4B0082' // 深紫色表示Total Invested
        },
        lineStyle: {
          width: 2
        },
        emphasis: {
          focus: 'series'
        },
        label: {
          show: false
        },
        data: monthlyBreakdown.map((item: MonthlyBreakdownItem) =>
          parseFloat(item.initialInvestmentAmount) +
          parseFloat(item.monthlyInvestmentAmount)
        )
      },
      {
        name: 'Total Return',
        type: 'line',
        yAxisIndex: 0, // 使用左轴
        itemStyle: {
          color: '#008B8B' // 深青色表示Total Return
        },
        lineStyle: {
          width: 2
        },
        emphasis: {
          focus: 'series'
        },
        label: {
          show: false
        },
        data: monthlyBreakdown.map((item: MonthlyBreakdownItem) =>
          parseFloat(item.initialInvestmentReturn) +
          parseFloat(item.monthlyInvestmentReturn) +
          parseFloat(item.dividendAmount) +
          parseFloat(item.dividendReturn)
        )
      }
    ]
  };

  return (
    <div className="mt-6">
      {/* <CardContent> */}
        {/* <Typography
          variant="h5"
          component="h2"
          sx={{
            textAlign: 'center',
            fontWeight: 600,
            my: 3,
            color: 'primary.main'
          }}
        >
          Calculation Results
        </Typography> */}
        
        {/* Wealth Growth Visual Comparison Area */}
        <div className={`mb-8 bg-gradient-to-r from-blue-50 ${parseFloat(nominalTotalReturn) >= 0 ? 'to-green-50' : 'to-red-50'} p-6 rounded-xl shadow-md`}>
          <Typography variant="subtitle1" className="text-center mb-3 font-bold text-gray-700">Wealth Growth Comparison</Typography>
          
          <div className="flex flex-col md:flex-row justify-between items-center">
            {/* Investment Amount */}
            <div className="flex-1 text-center p-4">
              <Typography variant="body1" className="text-gray-500 mb-1">Investment Amount</Typography>
              <Typography variant="h3" className="font-bold text-blue-700">
                {formatCurrency(totalInvested)}
              </Typography>
            </div>
            
            {/* Arrow and Growth Rate */}
            <div className="flex flex-col items-center py-4 px-2">
              <Typography
                variant="h1"
                className={`transform rotate-90 md:rotate-0 ${parseFloat(nominalTotalReturn) >= 0 ? 'text-green-600' : 'text-red-600'}`}
              >
                {parseFloat(nominalTotalReturn) >= 0 ? '→' : '→'}
              </Typography>
              <div className={`rounded-full px-4 py-2 mt-2 ${parseFloat(nominalTotalReturn) >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                <Typography
                  variant="h6"
                  className={`font-bold ${parseFloat(nominalTotalReturn) >= 0 ? 'text-green-800' : 'text-red-800'}`}
                >
                  {parseFloat(nominalTotalReturn) >= 0 ? '+' : ''}{formatPercentage(nominalTotalReturn)}
                </Typography>
              </div>
            </div>
            
            {/* Final Wealth */}
            <div className={`flex-1 text-center p-4 rounded-lg shadow-inner ${parseFloat(nominalTotalReturn) >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              <Typography variant="body1" className="text-gray-700 mb-1">Final Wealth (With Dividends)</Typography>
              <Typography
                variant="h2"
                className={`font-bold ${parseFloat(nominalTotalReturn) >= 0 ? 'text-green-700' : 'text-red-700'}`}
                sx={{ fontSize: '2.5rem' }}
              >
                <span className="inline-block">$<CountUp
                  start={0}
                  end={parseFloat(investmentGrewToTotalReturn)}
                  duration={2.5}
                  decimals={2}
                  separator=","
                  useEasing={true}
                /></span>
              </Typography>
              <Typography
                variant="body2"
                className={`mt-1 ${parseFloat(nominalTotalReturn) >= 0 ? 'text-green-600' : 'text-red-600'}`}
              >
                {parseFloat(investmentGrewToTotalReturn) > parseFloat(totalInvested)
                  ? `Growth of ${(parseFloat(investmentGrewToTotalReturn) / parseFloat(totalInvested)).toFixed(1)}x`
                  : `Loss of ${((1 - parseFloat(investmentGrewToTotalReturn) / parseFloat(totalInvested)) * 100).toFixed(1)}%`
                }
              </Typography>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-6 mb-6"> {/* Main container with increased spacing */}
          {/* Price Returns Group */}
          <div className="w-full bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', mb: 3 }}>Price Returns</Typography>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-5">
              <div className="bg-blue-50 p-4 rounded-lg shadow-sm border border-blue-100 hover:shadow-md transition-shadow">
                <Typography variant="body2" className="text-gray-600">Nominal Price Return:</Typography>
                <Typography variant="h6" className="font-bold text-blue-700">{formatPercentage(nominalPriceReturn)}</Typography>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg shadow-sm border border-blue-100 hover:shadow-md transition-shadow">
                <Typography variant="body2" className="text-gray-600">Annualized Price Return:</Typography>
                <Typography variant="h6" className="font-bold text-blue-700">{formatPercentage(annualizedPriceReturn)}</Typography>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg shadow-sm border border-blue-100 hover:shadow-md transition-shadow">
                <Typography variant="body2" className="text-gray-600">
                  Nominal Price Return <br />
                  (Including Dividends)
                </Typography>
                <Typography variant="h6" className="font-bold text-blue-700">{formatPercentage(nominalPriceReturnWithDividends)}</Typography>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg shadow-sm border border-blue-100 hover:shadow-md transition-shadow">
                <Typography variant="body2" className="text-gray-600">
                  Annualized Price Return <br />
                  (Including Dividends)
                </Typography>
                <Typography variant="h6" className="font-bold text-blue-700">{formatPercentage(annualizedPriceReturnWithDividends)}</Typography>
              </div>
            </div>
          </div>

          {/* Total Invested Group - 单独一行 */}
          <div className="w-full bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', mb: 3 }}>Investment Summary</Typography>
            <div>
                <div className="w-full sm:w-1/2 md:w-1/3 bg-blue-100 p-5 rounded-lg shadow-sm border border-blue-200 hover:shadow-md transition-shadow">
                    <Typography variant="body2" className="text-gray-600">Total Invested:</Typography>
                    <Typography variant="h6" className="font-bold text-blue-800">{formatCurrency(totalInvested)}</Typography>
                </div>
            </div>
          </div>

          {/* Total Returns Group (Without Dividends) */}
          <div className="w-full bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', mb: 3 }}>Growth (Excluding Dividends)</Typography>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              <div className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <Typography variant="body2" className="text-gray-600">Nominal Total Return:</Typography>
                <Typography variant="h6" className="font-bold">{formatPercentage(nominalTotalReturnWithoutDividends)}</Typography>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <Typography variant="body2" className="text-gray-600">Annualized Total Return:</Typography>
                <Typography variant="h6" className="font-bold">{formatPercentage(annualizedTotalReturnWithoutDividends)}</Typography>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <Typography variant="body2" className="text-gray-600">Investment Grew To:</Typography>
                <Typography variant="h6" className="font-bold text-green-700">{formatCurrency(investmentGrewToPrice)}</Typography>
              </div>
            </div>
          </div>

          {/* Total Returns Group (With Dividends) */}
          <div className="w-full bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', mb: 3 }}>Growth (Including Dividends)</Typography>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              <div className="bg-green-50 p-4 rounded-lg shadow-sm border border-green-100 hover:shadow-md transition-shadow">
                <Typography variant="body2" className="text-gray-600">Nominal Total Return:</Typography>
                <Typography variant="h6" className="font-bold text-green-700">{formatPercentage(nominalTotalReturn)}</Typography>
              </div>
              <div className="bg-green-50 p-4 rounded-lg shadow-sm border border-green-100 hover:shadow-md transition-shadow">
                <Typography variant="body2" className="text-gray-600">Annualized Total Return:</Typography>
                <Typography variant="h6" className="font-bold text-green-700">{formatPercentage(annualizedTotalReturn)}</Typography>
              </div>
              <div className="bg-green-50 p-4 rounded-lg shadow-sm border border-green-100 hover:shadow-md transition-shadow">
                <Typography variant="body2" className="text-gray-600">Investment Grew To:</Typography>
                <Typography variant="h6" className="font-bold text-green-800" sx={{ fontSize: '1.5rem' }}>
                  <span className="inline-block">$<CountUp
                    start={0}
                    end={parseFloat(investmentGrewToTotalReturn)}
                    duration={2}
                    decimals={2}
                    separator=","
                    useEasing={true}
                  /></span>
                </Typography>
              </div>
            </div>
          </div>
        </div>
        {/* <h2 className="text-xl font-semibold mb-4 text-center pt-5">Monthly Breakdown</h2> */}
        <Typography
          variant="h5"
          component="h2"
          sx={{
            textAlign: 'center',
            fontWeight: 600,
            my: 3,
            color: 'primary.main'
          }}
        >
          Monthly Breakdown
        </Typography>
        <ReactECharts
          option={chartOption}
          style={{ height: 500, width: '100%' }}
          className="mt-4"
          ref={barChartRef}
          onEvents={{
            'mouseover': (params: { seriesName: string }) => {
              if (pieChartRef.current) {
                const seriesNames = [
                  'Initial Investment Amount',
                  'Initial Investment Return',
                  'Monthly Investment Amount',
                  'Monthly Investment Return',
                  'Dividend Amount',
                  'Dividend Return'
                ];
                const pieDataIndexMap = {
                  'Initial Investment Amount': 0,
                  'Initial Investment Return': 3,
                  'Monthly Investment Amount': 1,
                  'Monthly Investment Return': 4,
                  'Dividend Amount': 2,
                  'Dividend Return': 5
                };
                const totalSeries = ['Total Invested', 'Total Return'];
                const dataIndex = seriesNames.indexOf(params.seriesName);
                const totalIndex = totalSeries.indexOf(params.seriesName);
                if (dataIndex !== -1) {
                  const seriesName = params.seriesName as keyof typeof pieDataIndexMap;
                  const pieDataIndex = pieDataIndexMap[seriesName];
                  pieChartRef.current.getEchartsInstance().dispatchAction({
                    type: 'highlight',
                    seriesIndex: 0,
                    dataIndex: pieDataIndex
                  });
                } else if (totalIndex !== -1) {
                  pieChartRef.current.getEchartsInstance().dispatchAction({
                    type: 'highlight',
                    seriesIndex: 1,
                    dataIndex: totalIndex
                  });
                }
              }
            },
            'mouseout': (params: { seriesName: string }) => {
              if (pieChartRef.current) {
                const seriesNames = [
                  'Initial Investment Amount',
                  'Initial Investment Return',
                  'Monthly Investment Amount',
                  'Monthly Investment Return',
                  'Dividend Amount',
                  'Dividend Return'
                ];
                const pieDataIndexMap = {
                  'Initial Investment Amount': 0,
                  'Initial Investment Return': 3,
                  'Monthly Investment Amount': 1,
                  'Monthly Investment Return': 4,
                  'Dividend Amount': 2,
                  'Dividend Return': 5
                };
                const totalSeries = ['Total Invested', 'Total Return'];
                const dataIndex = seriesNames.indexOf(params.seriesName);
                const totalIndex = totalSeries.indexOf(params.seriesName);
                if (dataIndex !== -1) {
                  const seriesName = params.seriesName as keyof typeof pieDataIndexMap;
                  const pieDataIndex = pieDataIndexMap[seriesName];
                  pieChartRef.current.getEchartsInstance().dispatchAction({
                    type: 'downplay',
                    seriesIndex: 0,
                    dataIndex: pieDataIndex
                  });
                } else if (totalIndex !== -1) {
                  pieChartRef.current.getEchartsInstance().dispatchAction({
                    type: 'downplay',
                    seriesIndex: 1,
                    dataIndex: totalIndex
                  });
                }
              }
            },
            'legendselectchanged': (params: { name: string; selected: { [key: string]: boolean } }) => {
              if (pieChartRef.current) {
                const pieData = [
                  { value: parseFloat(monthlyBreakdown[monthlyBreakdown.length - 1].initialInvestmentAmount), name: 'Initial Investment Amount', itemStyle: { color: '#1976D2' } },
                  { value: parseFloat(monthlyBreakdown[monthlyBreakdown.length - 1].initialInvestmentReturn), name: 'Initial Investment Return', itemStyle: { color: 'rgba(25, 118, 210, 0.6)' } },
                  { value: parseFloat(monthlyBreakdown[monthlyBreakdown.length - 1].monthlyInvestmentAmount), name: 'Monthly Investment Amount', itemStyle: { color: '#388E3C' } },
                  { value: parseFloat(monthlyBreakdown[monthlyBreakdown.length - 1].monthlyInvestmentReturn), name: 'Monthly Investment Return', itemStyle: { color: 'rgba(56, 142, 60, 0.6)' } },
                  { value: parseFloat(monthlyBreakdown[monthlyBreakdown.length - 1].dividendAmount), name: 'Dividend Amount', itemStyle: { color: '#F57C00' } },
                  { value: parseFloat(monthlyBreakdown[monthlyBreakdown.length - 1].dividendReturn), name: 'Dividend Return', itemStyle: { color: 'rgba(245, 124, 0, 0.6)' } }
                ];
                const updatedPieData = pieData.map(item => {
                  const isSelected = params.selected[item.name];
                  return {
                    ...item,
                    value: isSelected ? item.value : 0
                  };
                });
                const pieInstance = pieChartRef.current.getEchartsInstance();
                pieInstance.setOption({
                  series: [{
                    type: 'pie',
                    radius: '50%',
                    data: updatedPieData,
                    emphasis: {
                      itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                      }
                    }
                  }]
                });
              }
            }
          }}
        />
        
        <Typography
          variant="h5"
          component="h2"
          sx={{
            textAlign: 'center',
            fontWeight: 600,
            my: 3,
            color: 'primary.main'
          }}
        >
          Final Day Breakdown
        </Typography>
        <ReactECharts
          option={{
            title: {
              left: 'center',
              top: 10,
              textStyle: {
                fontSize: 20,
                fontWeight: 'bold',
                color: '#333'
              }
            },
            tooltip: {
              trigger: 'item',
              formatter: function (params: { name: string; value: number; percent: number }) {
                return `${params.name}: $${params.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${params.percent}%)`;
              }
            },
            legend: {
              show: false
            },
            series: [
              {
                type: 'pie',
                radius: ['0%', '60%'],
                center: ['50%', '50%'],
                data: [
                  { value: parseFloat(monthlyBreakdown[monthlyBreakdown.length - 1].initialInvestmentAmount), name: 'Initial Investment Amount', itemStyle: { color: '#1976D2' } },
                  { value: parseFloat(monthlyBreakdown[monthlyBreakdown.length - 1].monthlyInvestmentAmount), name: 'Monthly Investment Amount', itemStyle: { color: '#388E3C' } },
                  { value: parseFloat(monthlyBreakdown[monthlyBreakdown.length - 1].dividendAmount), name: 'Dividend Amount', itemStyle: { color: '#F57C00' } },
                  { value: parseFloat(monthlyBreakdown[monthlyBreakdown.length - 1].initialInvestmentReturn), name: 'Initial Investment Return', itemStyle: { color: 'rgba(25, 118, 210, 0.6)' } },
                  { value: parseFloat(monthlyBreakdown[monthlyBreakdown.length - 1].monthlyInvestmentReturn), name: 'Monthly Investment Return', itemStyle: { color: 'rgba(56, 142, 60, 0.6)' } },
                  { value: parseFloat(monthlyBreakdown[monthlyBreakdown.length - 1].dividendReturn), name: 'Dividend Return', itemStyle: { color: 'rgba(245, 124, 0, 0.6)' } }
                ],
                emphasis: {
                  itemStyle: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                  }
                }
              },
              {
                type: 'pie',
                radius: ['60%', '75%'],
                center: ['50%', '50%'],
                data: [
                  {
                    value: parseFloat(monthlyBreakdown[monthlyBreakdown.length - 1].initialInvestmentAmount) +
                           parseFloat(monthlyBreakdown[monthlyBreakdown.length - 1].monthlyInvestmentAmount) +
                           parseFloat(monthlyBreakdown[monthlyBreakdown.length - 1].dividendAmount),
                    name: 'Total Invested',
                    itemStyle: { color: '#4B0082' } // 深紫色表示Total Invested，与内层颜色区别且符合主题
                  },
                  {
                    value: parseFloat(monthlyBreakdown[monthlyBreakdown.length - 1].initialInvestmentReturn) +
                           parseFloat(monthlyBreakdown[monthlyBreakdown.length - 1].monthlyInvestmentReturn) +
                           parseFloat(monthlyBreakdown[monthlyBreakdown.length - 1].dividendReturn),
                    name: 'Total Return',
                    itemStyle: { color: '#008B8B' } // 深青色表示Total Return，与内层颜色区别且符合主题
                  }
                ],
                emphasis: {
                  itemStyle: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                  }
                }
              }
            ]
          }}
          style={{ height: 400, width: '100%' }}
          className="mt-4"
          ref={pieChartRef}
          onEvents={{
            'mouseover': (params: { dataIndex: number; name: string; seriesIndex: number }) => {
              if (barChartRef.current) {
                const seriesNames = [
                  'Initial Investment Amount',
                  'Initial Investment Return',
                  'Monthly Investment Amount',
                  'Monthly Investment Return',
                  'Dividend Amount',
                  'Dividend Return'
                ];
                const totalSeries = ['Total Invested', 'Total Return'];
                const seriesIndex = seriesNames.indexOf(params.name);
                const totalIndex = totalSeries.indexOf(params.name);
                if (seriesIndex !== -1 && barChartRef.current) {
                  barChartRef.current.getEchartsInstance().dispatchAction({
                    type: 'highlight',
                    seriesIndex: seriesIndex
                  });
                } else if (totalIndex !== -1 && barChartRef.current) {
                  barChartRef.current.getEchartsInstance().dispatchAction({
                    type: 'highlight',
                    seriesIndex: totalIndex + 6 // 由于Total Invested和Total Return在series数组中的索引是6和7
                  });
                }
              }
            },
            'mouseout': (params: { dataIndex: number; name: string; seriesIndex: number }) => {
              if (barChartRef.current) {
                const seriesNames = [
                  'Initial Investment Amount',
                  'Initial Investment Return',
                  'Monthly Investment Amount',
                  'Monthly Investment Return',
                  'Dividend Amount',
                  'Dividend Return'
                ];
                const totalSeries = ['Total Invested', 'Total Return'];
                const seriesIndex = seriesNames.indexOf(params.name);
                const totalIndex = totalSeries.indexOf(params.name);
                if (seriesIndex !== -1 && barChartRef.current) {
                  barChartRef.current.getEchartsInstance().dispatchAction({
                    type: 'downplay',
                    seriesIndex: seriesIndex
                  });
                } else if (totalIndex !== -1 && barChartRef.current) {
                  barChartRef.current.getEchartsInstance().dispatchAction({
                    type: 'downplay',
                    seriesIndex: totalIndex + 6 // 由于Total Invested和Total Return在series数组中的索引是6和7
                  });
                }
              }
            },
            'legendselectchanged': (params: { name: string; selected: { [key: string]: boolean } }) => {
              if (barChartRef.current) {
                const seriesNames = [
                  'Initial Investment Amount',
                  'Initial Investment Return',
                  'Monthly Investment Amount',
                  'Monthly Investment Return',
                  'Dividend Amount',
                  'Dividend Return'
                ];
                seriesNames.forEach((name, index) => {
                  const isSelected = params.selected[name];
                  if (barChartRef.current) {
                    barChartRef.current.getEchartsInstance().dispatchAction({
                      type: isSelected ? 'showSeries' : 'hideSeries',
                      seriesIndex: index
                    });
                  }
                });
              }
            }
          }}
        />
      {/* </CardContent> */}
      {/* 链接卡片：如何投资 QQQ */}
      <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-md p-5 border border-blue-100 hover:shadow-lg hover:border-blue-200 transition-all duration-200">
        <a
          href="https://jomonylw.github.io/en/posts/1728723295012-invest-qqq"
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: 'none' }}
          className="block"
        >
          <div className="flex items-center">
            <div className="mr-4 text-2xl">📈</div>
            <div className="flex-1">
              <Typography variant="h6" component="h3" sx={{ color: 'primary.main', fontWeight: 'bold', mb: 1 }}>
                How to Invest in QQQ ETF
              </Typography>
              <div className="flex items-center text-blue-600 text-sm font-medium">
                Read guide <span className="ml-1">→</span>
              </div>
            </div>
          </div>
        </a>
      </div>
    </div>
  );
}
