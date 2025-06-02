"use client";
import React from 'react';
import { Typography } from '@mui/material';
import ReactECharts from 'echarts-for-react';
import WealthGrowthComparison from './WealthGrowthComparison';
import type { InvestmentResultsChartProps, MonthlyBreakdownItem } from '../types';

export default function InvestmentResultsChart({ results }: InvestmentResultsChartProps) {
  const barChartRef = React.useRef<ReactECharts>(null);
  const pieChartRef = React.useRef<ReactECharts>(null);
  const [pieChartTitle, setPieChartTitle] = React.useState('');
  const titleUpdateTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const {
    monthlyBreakdown,
  } = results;

  // Initialize pie chart title
  React.useEffect(() => {
    if (monthlyBreakdown && monthlyBreakdown.length > 0) {
      setPieChartTitle(formatDateWithTag(monthlyBreakdown[monthlyBreakdown.length - 1].date));
    }
  }, [monthlyBreakdown]);

  // Debounced title update function to prevent rapid changes
  const updatePieChartTitle = React.useCallback((newTitle: string) => {
    if (titleUpdateTimeoutRef.current) {
      clearTimeout(titleUpdateTimeoutRef.current);
    }
    titleUpdateTimeoutRef.current = setTimeout(() => {
      setPieChartTitle(newTitle);
    }, 50); // Small delay to prevent rapid updates
  }, []);

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (titleUpdateTimeoutRef.current) {
        clearTimeout(titleUpdateTimeoutRef.current);
      }
    };
  }, []);

  // Helper function to format date with tag-like styling
  const formatDateWithTag = (date: string, suffix: string = 'Breakdown') => {
    return `<span style="
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 0px 7px;
      border-radius: 10px;
      font-weight: 600;
      font-size: 1.5rem;
      margin-right: 8px;
      display: inline-block;
      box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
      vertical-align: middle;
      min-height: 2rem;
      line-height: 2rem;
      transition: all 0.2s ease-in-out;
      white-space: nowrap;
    ">${date}</span><span style="
      font-weight: 600;
      font-size: 1.5rem;
      vertical-align: middle;
      min-height: 2rem;
      line-height: 2rem;
      transition: all 0.2s ease-in-out;
      white-space: nowrap;
    ">${suffix}</span>`;
  };

  // Helper function to format date without styling but with consistent layout
  const formatDatePlain = (date: string, suffix: string = 'Breakdown') => {
    return `<span style="
      font-weight: 600;
      font-size: 1.5rem;
      vertical-align: middle;
      min-height: 2rem;
      line-height: 2rem;
      display: inline-block;
      margin-right: 8px;
      transition: all 0.2s ease-in-out;
      white-space: nowrap;
      color: #1976d2;
    ">${date}</span><span style="
      font-weight: 600;
      font-size: 1.5rem;
      vertical-align: middle;
      min-height: 2rem;
      line-height: 2rem;
      transition: all 0.2s ease-in-out;
      white-space: nowrap;
      color: #1976d2;
    ">${suffix}</span>`;
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
          color: 'rgba(102, 126, 234, 0.6)',
          width: 1
        }
      },
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: 'rgba(255, 255, 255, 0.3)',
      borderWidth: 1,
      borderRadius: 12,
      padding: [12, 16],
      textStyle: {
        color: '#333',
        fontSize: 14,
        fontWeight: 'normal'
      },
      extraCssText: `
        backdrop-filter: blur(12px);
        box-shadow: 0 8px 32px rgba(31, 38, 135, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.3);
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      `,
      formatter: function (params: { name: string; marker: string; seriesName: string; value: string | number; color: string }[]) {
        let result = `<div style="margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid rgba(102, 126, 234, 0.2);">
          <span style="font-weight: 600; font-size: 14px; color: #667eea;">${params[0].name}</span>
        </div>`;

        params.forEach(function (item: { marker: string; seriesName: string; value: string | number; color: string }) {
          const val = parseFloat(String(item.value));
          if (val === 0) return; // Skip zero values for cleaner display

          const isReturn = item.seriesName.includes('Return');
          const isTotal = item.seriesName.includes('Total');

          // Color-code the values based on series type
          let valueColor = '#333';
          if (isReturn && val > 0) valueColor = '#4caf50';
          else if (isReturn && val < 0) valueColor = '#f44336';
          else if (isTotal) valueColor = '#667eea';

          result += `<div style="display: flex; align-items: center; margin: 4px 0; padding: 3px 0;">
            <span style="margin-right: 6px; width: 10px; height: 10px; border-radius: 50%; background: ${item.color}; display: inline-block;"></span>
            <span style="flex: 1; font-size: 12px; color: #666; margin-right: 8px;">${item.seriesName}:</span>
            <span style="font-weight: 600; font-size: 13px; color: ${valueColor};">$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>`;
        });

        return result;
      }
    },
    legend: {
      show: false,
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
          color: '#1976D2', // 更现代的蓝色
          borderRadius: [2, 2, 0, 0] // 圆角：上方圆角
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
          color: 'rgba(25, 118, 210, 0.6)', // 更现代的蓝色，半透明
          borderRadius: [2, 2, 0, 0] // 圆角：上方圆角
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
          color: '#388E3C', // 更现代的绿色
          borderRadius: [2, 2, 0, 0] // 圆角：上方圆角
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
          color: 'rgba(56, 142, 60, 0.6)', // 更现代的绿色，半透明
          borderRadius: [2, 2, 0, 0] // 圆角：上方圆角
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
          color: '#F57C00', // 更现代的橙色
          borderRadius: [2, 2, 0, 0] // 圆角：上方圆角
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
          color: 'rgba(245, 124, 0, 0.6)', // 更现代的橙色，半透明
          borderRadius: [2, 2, 0, 0] // 圆角：上方圆角
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
        
        <WealthGrowthComparison results={results} />
        {/* <h2 className="text-xl font-semibold mb-4 text-center pt-5">Monthly Breakdown</h2> */}
        <Typography
          variant="h5"
          component="h2"
          sx={{
            textAlign: 'center',
            fontWeight: 600,
            my: 2,
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
            'mouseover': (params: { seriesName: string; dataIndex: number }) => {
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
                  // Show tooltip for the highlighted pie chart segment
                  pieChartRef.current.getEchartsInstance().dispatchAction({
                    type: 'showTip',
                    seriesIndex: 0,
                    dataIndex: pieDataIndex
                  });
                } else if (totalIndex !== -1) {
                  pieChartRef.current.getEchartsInstance().dispatchAction({
                    type: 'highlight',
                    seriesIndex: 1,
                    dataIndex: totalIndex
                  });
                  // Show tooltip for the highlighted pie chart segment
                  pieChartRef.current.getEchartsInstance().dispatchAction({
                    type: 'showTip',
                    seriesIndex: 1,
                    dataIndex: totalIndex
                  });
                }
                // 更新饼状图数据以反映当前日期的投资分解
                const dateIndex = params.dataIndex;
                const currentData = monthlyBreakdown[dateIndex];
                const pieData = [
                  { value: parseFloat(currentData.initialInvestmentAmount), name: 'Initial Investment Amount', itemStyle: { color: '#1976D2', borderRadius: 4 } },
                  { value: parseFloat(currentData.monthlyInvestmentAmount), name: 'Monthly Investment Amount', itemStyle: { color: '#388E3C', borderRadius: 4 } },
                  { value: parseFloat(currentData.dividendAmount), name: 'Dividend Amount', itemStyle: { color: '#F57C00', borderRadius: 4 } },
                  { value: parseFloat(currentData.initialInvestmentReturn), name: 'Initial Investment Return', itemStyle: { color: 'rgba(25, 118, 210, 0.6)', borderRadius: 4 } },
                  { value: parseFloat(currentData.monthlyInvestmentReturn), name: 'Monthly Investment Return', itemStyle: { color: 'rgba(56, 142, 60, 0.6)', borderRadius: 4 } },
                  { value: parseFloat(currentData.dividendReturn), name: 'Dividend Return', itemStyle: { color: 'rgba(245, 124, 0, 0.6)', borderRadius: 4 } }
                ];
                const totalPieData = [
                  {
                    value: parseFloat(currentData.initialInvestmentAmount) +
                           parseFloat(currentData.monthlyInvestmentAmount) +
                           parseFloat(currentData.dividendAmount),
                    name: 'Total Invested',
                    itemStyle: { color: '#4B0082', borderRadius: 4 }
                  },
                  {
                    value: parseFloat(currentData.initialInvestmentReturn) +
                           parseFloat(currentData.monthlyInvestmentReturn) +
                           parseFloat(currentData.dividendReturn),
                    name: 'Total Return',
                    itemStyle: { color: '#008B8B', borderRadius: 4 }
                  }
                ];
                pieChartRef.current.getEchartsInstance().setOption({
                  series: [
                    {
                      type: 'pie',
                      radius: ['0%', '60%'],
                      center: ['50%', '50%'],
                      itemStyle: {
                        borderRadius: 4
                      },
                      data: pieData,
                      emphasis: {
                        itemStyle: {
                          shadowBlur: 15,
                          shadowOffsetX: 0,
                          shadowColor: 'rgba(102, 126, 234, 0.4)',
                          borderRadius: 4,
                          borderWidth: 2,
                          borderColor: 'rgba(255, 255, 255, 0.8)'
                        },
                        label: {
                          show: true,
                          fontSize: 14,
                          fontWeight: '600',
                          color: '#FFFFFF',
                          backgroundColor: 'rgba(102, 126, 234, 0.95)',
                          borderRadius: 8,
                          padding: [8, 12],
                          borderWidth: 1,
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                          shadowBlur: 8,
                          shadowColor: 'rgba(102, 126, 234, 0.3)'
                        }
                      }
                    },
                    {
                      type: 'pie',
                      radius: ['60%', '75%'],
                      center: ['50%', '50%'],
                      itemStyle: {
                        borderRadius: 4
                      },
                      data: totalPieData,
                      emphasis: {
                        itemStyle: {
                          shadowBlur: 15,
                          shadowOffsetX: 0,
                          shadowColor: 'rgba(102, 126, 234, 0.4)',
                          borderRadius: 4,
                          borderWidth: 2,
                          borderColor: 'rgba(255, 255, 255, 0.8)'
                        },
                        label: {
                          show: true,
                          fontSize: 14,
                          fontWeight: '600',
                          color: '#FFFFFF',
                          backgroundColor: 'rgba(102, 126, 234, 0.95)',
                          borderRadius: 8,
                          padding: [8, 12],
                          borderWidth: 1,
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                          shadowBlur: 8,
                          shadowColor: 'rgba(102, 126, 234, 0.3)'
                        }
                      }
                    }
                  ]
                });
                // 更新饼状图标题以反映当前日期
                updatePieChartTitle(formatDateWithTag(currentData.date));
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
                  // Hide tooltip for the pie chart segment
                  pieChartRef.current.getEchartsInstance().dispatchAction({
                    type: 'hideTip'
                  });
                } else if (totalIndex !== -1) {
                  pieChartRef.current.getEchartsInstance().dispatchAction({
                    type: 'downplay',
                    seriesIndex: 1,
                    dataIndex: totalIndex
                  });
                  // Hide tooltip for the pie chart segment
                  pieChartRef.current.getEchartsInstance().dispatchAction({
                    type: 'hideTip'
                  });
                }
                // 恢复饼状图数据为最后一天的数据
                const lastData = monthlyBreakdown[monthlyBreakdown.length - 1];
                const pieData = [
                  { value: parseFloat(lastData.initialInvestmentAmount), name: 'Initial Investment Amount', itemStyle: { color: '#1976D2', borderRadius: 4 } },
                  { value: parseFloat(lastData.monthlyInvestmentAmount), name: 'Monthly Investment Amount', itemStyle: { color: '#388E3C', borderRadius: 4 } },
                  { value: parseFloat(lastData.dividendAmount), name: 'Dividend Amount', itemStyle: { color: '#F57C00', borderRadius: 4 } },
                  { value: parseFloat(lastData.initialInvestmentReturn), name: 'Initial Investment Return', itemStyle: { color: 'rgba(25, 118, 210, 0.6)', borderRadius: 4 } },
                  { value: parseFloat(lastData.monthlyInvestmentReturn), name: 'Monthly Investment Return', itemStyle: { color: 'rgba(56, 142, 60, 0.6)', borderRadius: 4 } },
                  { value: parseFloat(lastData.dividendReturn), name: 'Dividend Return', itemStyle: { color: 'rgba(245, 124, 0, 0.6)', borderRadius: 4 } }
                ];
                const totalPieData = [
                  {
                    value: parseFloat(lastData.initialInvestmentAmount) +
                           parseFloat(lastData.monthlyInvestmentAmount) +
                           parseFloat(lastData.dividendAmount),
                    name: 'Total Invested',
                    itemStyle: { color: '#4B0082', borderRadius: 4 }
                  },
                  {
                    value: parseFloat(lastData.initialInvestmentReturn) +
                           parseFloat(lastData.monthlyInvestmentReturn) +
                           parseFloat(lastData.dividendReturn),
                    name: 'Total Return',
                    itemStyle: { color: '#008B8B', borderRadius: 4 }
                  }
                ];
                pieChartRef.current.getEchartsInstance().setOption({
                  series: [
                    {
                      type: 'pie',
                      radius: ['0%', '60%'],
                      center: ['50%', '50%'],
                      itemStyle: {
                        borderRadius: 4
                      },
                      data: pieData,
                      emphasis: {
                        itemStyle: {
                          shadowBlur: 15,
                          shadowOffsetX: 0,
                          shadowColor: 'rgba(102, 126, 234, 0.4)',
                          borderRadius: 4,
                          borderWidth: 2,
                          borderColor: 'rgba(255, 255, 255, 0.8)'
                        },
                        label: {
                          show: true,
                          fontSize: 14,
                          fontWeight: '600',
                          color: '#FFFFFF',
                          backgroundColor: 'rgba(102, 126, 234, 0.95)',
                          borderRadius: 8,
                          padding: [8, 12],
                          borderWidth: 1,
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                          shadowBlur: 8,
                          shadowColor: 'rgba(102, 126, 234, 0.3)'
                        }
                      }
                    },
                    {
                      type: 'pie',
                      radius: ['60%', '75%'],
                      center: ['50%', '50%'],
                      itemStyle: {
                        borderRadius: 4
                      },
                      data: totalPieData,
                      emphasis: {
                        itemStyle: {
                          shadowBlur: 15,
                          shadowOffsetX: 0,
                          shadowColor: 'rgba(102, 126, 234, 0.4)',
                          borderRadius: 4,
                          borderWidth: 2,
                          borderColor: 'rgba(255, 255, 255, 0.8)'
                        },
                        label: {
                          show: true,
                          fontSize: 14,
                          fontWeight: '600',
                          color: '#FFFFFF',
                          backgroundColor: 'rgba(102, 126, 234, 0.95)',
                          borderRadius: 8,
                          padding: [8, 12],
                          borderWidth: 1,
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                          shadowBlur: 8,
                          shadowColor: 'rgba(102, 126, 234, 0.3)'
                        }
                      }
                    }
                  ]
                });
                // 恢复饼状图标题为默认值（最后一天的日期）
                updatePieChartTitle(formatDateWithTag(lastData.date));
              }
            },
            'legendselectchanged': (params: { name: string; selected: { [key: string]: boolean } }) => {
              if (pieChartRef.current) {
                const pieData = [
                  { value: parseFloat(monthlyBreakdown[monthlyBreakdown.length - 1].initialInvestmentAmount), name: 'Initial Investment Amount', itemStyle: { color: '#1976D2', borderRadius: 4 } },
                  { value: parseFloat(monthlyBreakdown[monthlyBreakdown.length - 1].initialInvestmentReturn), name: 'Initial Investment Return', itemStyle: { color: 'rgba(25, 118, 210, 0.6)', borderRadius: 4 } },
                  { value: parseFloat(monthlyBreakdown[monthlyBreakdown.length - 1].monthlyInvestmentAmount), name: 'Monthly Investment Amount', itemStyle: { color: '#388E3C', borderRadius: 4 } },
                  { value: parseFloat(monthlyBreakdown[monthlyBreakdown.length - 1].monthlyInvestmentReturn), name: 'Monthly Investment Return', itemStyle: { color: 'rgba(56, 142, 60, 0.6)', borderRadius: 4 } },
                  { value: parseFloat(monthlyBreakdown[monthlyBreakdown.length - 1].dividendAmount), name: 'Dividend Amount', itemStyle: { color: '#F57C00', borderRadius: 4 } },
                  { value: parseFloat(monthlyBreakdown[monthlyBreakdown.length - 1].dividendReturn), name: 'Dividend Return', itemStyle: { color: 'rgba(245, 124, 0, 0.6)', borderRadius: 4 } }
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
                    itemStyle: {
                      borderRadius: 4
                    },
                    data: updatedPieData,
                    emphasis: {
                      itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)',
                        borderRadius: 4
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
          id="pie-chart-title"
          sx={{
            textAlign: 'center',
            fontWeight: 600,
            my: 2,
            color: 'primary.main',
            minHeight: '3rem', // Ensure consistent height
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease-in-out',
            overflow: 'hidden', // Prevent layout shifts
            '& span': {
              transition: 'all 0.2s ease-in-out'
            }
          }}
          dangerouslySetInnerHTML={{
            __html: pieChartTitle || formatDateWithTag(monthlyBreakdown[monthlyBreakdown.length - 1].date)
          }}
        />
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
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderColor: 'rgba(255, 255, 255, 0.3)',
              borderWidth: 1,
              borderRadius: 12,
              padding: [12, 16],
              textStyle: {
                color: '#333',
                fontSize: 14,
                fontWeight: 'normal'
              },
              extraCssText: `
                backdrop-filter: blur(12px);
                box-shadow: 0 8px 32px rgba(31, 38, 135, 0.2);
                border: 1px solid rgba(255, 255, 255, 0.3);
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              `,
              formatter: function (params: { name: string; value: number; percent: number; color: string; data: { itemStyle: { color: string } } }) {
                const isReturn = params.name.includes('Return');
                const isTotal = params.name.includes('Total');

                // Color-code the values based on type
                let valueColor = '#333';
                let percentColor = '#666';
                if (isReturn && params.value > 0) {
                  valueColor = '#4caf50';
                  percentColor = '#4caf50';
                } else if (isReturn && params.value < 0) {
                  valueColor = '#f44336';
                  percentColor = '#f44336';
                } else if (isTotal) {
                  valueColor = '#667eea';
                  percentColor = '#667eea';
                }

                return `<div style="text-align: center;">
                  <div style="margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid rgba(102, 126, 234, 0.2);">
                    <span style="font-weight: 600; font-size: 14px; color: #667eea;">${params.name}</span>
                  </div>
                  <div style="margin: 4px 0;">
                    <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 3px;">
                      <span style="margin-right: 6px; width: 10px; height: 10px; border-radius: 50%; background: ${params.color}; display: inline-block;"></span>
                      <span style="font-weight: 600; font-size: 13px; color: ${valueColor};">$${params.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div style="font-size: 12px; color: ${percentColor}; font-weight: 500;">
                      ${params.percent}% of total
                    </div>
                  </div>
                </div>`;
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
                itemStyle: {
                  borderRadius: 4 // 圆角
                },
                data: [
                  { value: parseFloat(monthlyBreakdown[monthlyBreakdown.length - 1].initialInvestmentAmount), name: 'Initial Investment Amount', itemStyle: { color: '#1976D2', borderRadius: 4 } },
                  { value: parseFloat(monthlyBreakdown[monthlyBreakdown.length - 1].monthlyInvestmentAmount), name: 'Monthly Investment Amount', itemStyle: { color: '#388E3C', borderRadius: 4 } },
                  { value: parseFloat(monthlyBreakdown[monthlyBreakdown.length - 1].dividendAmount), name: 'Dividend Amount', itemStyle: { color: '#F57C00', borderRadius: 4 } },
                  { value: parseFloat(monthlyBreakdown[monthlyBreakdown.length - 1].initialInvestmentReturn), name: 'Initial Investment Return', itemStyle: { color: 'rgba(25, 118, 210, 0.6)', borderRadius: 4 } },
                  { value: parseFloat(monthlyBreakdown[monthlyBreakdown.length - 1].monthlyInvestmentReturn), name: 'Monthly Investment Return', itemStyle: { color: 'rgba(56, 142, 60, 0.6)', borderRadius: 4 } },
                  { value: parseFloat(monthlyBreakdown[monthlyBreakdown.length - 1].dividendReturn), name: 'Dividend Return', itemStyle: { color: 'rgba(245, 124, 0, 0.6)', borderRadius: 4 } }
                ],
                emphasis: {
                  itemStyle: {
                    shadowBlur: 15,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(102, 126, 234, 0.4)',
                    borderRadius: 4,
                    borderWidth: 2,
                    borderColor: 'rgba(255, 255, 255, 0.8)'
                  },
                  label: {
                    show: true,
                    fontSize: 14,
                    fontWeight: '600',
                    color: '#FFFFFF',
                    backgroundColor: 'rgba(102, 126, 234, 0.95)',
                    borderRadius: 8,
                    padding: [8, 12],
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    shadowBlur: 8,
                    shadowColor: 'rgba(102, 126, 234, 0.3)'
                  }
                }
              },
              {
                type: 'pie',
                radius: ['60%', '75%'],
                center: ['50%', '50%'],
                itemStyle: {
                  borderRadius: 4 // 圆角
                },
                data: [
                  {
                    value: parseFloat(monthlyBreakdown[monthlyBreakdown.length - 1].initialInvestmentAmount) +
                           parseFloat(monthlyBreakdown[monthlyBreakdown.length - 1].monthlyInvestmentAmount) +
                           parseFloat(monthlyBreakdown[monthlyBreakdown.length - 1].dividendAmount),
                    name: 'Total Invested',
                    itemStyle: { color: '#4B0082', borderRadius: 4 } // 深紫色表示Total Invested，与内层颜色区别且符合主题
                  },
                  {
                    value: parseFloat(monthlyBreakdown[monthlyBreakdown.length - 1].initialInvestmentReturn) +
                           parseFloat(monthlyBreakdown[monthlyBreakdown.length - 1].monthlyInvestmentReturn) +
                           parseFloat(monthlyBreakdown[monthlyBreakdown.length - 1].dividendReturn),
                    name: 'Total Return',
                    itemStyle: { color: '#008B8B', borderRadius: 4 } // 深青色表示Total Return，与内层颜色区别且符合主题
                  }
                ],
                emphasis: {
                  itemStyle: {
                    shadowBlur: 15,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(102, 126, 234, 0.4)',
                    borderRadius: 4,
                    borderWidth: 2,
                    borderColor: 'rgba(255, 255, 255, 0.8)'
                  },
                  label: {
                    show: true,
                    fontSize: 14,
                    fontWeight: '600',
                    color: '#FFFFFF',
                    backgroundColor: 'rgba(102, 126, 234, 0.95)',
                    borderRadius: 8,
                    padding: [8, 12],
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    shadowBlur: 8,
                    shadowColor: 'rgba(102, 126, 234, 0.3)'
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
                // 更新饼状图标题以反映当前高亮的系列
                updatePieChartTitle(formatDatePlain(params.name, ''));
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
                // 恢复饼状图标题为默认值（最后一天的日期）
                updatePieChartTitle(formatDateWithTag(monthlyBreakdown[monthlyBreakdown.length - 1].date));
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
