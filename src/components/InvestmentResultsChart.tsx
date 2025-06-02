"use client";
import React from 'react';
import { Typography } from '@mui/material';
import ReactECharts from 'echarts-for-react';
import WealthGrowthComparison from './WealthGrowthComparison';
import type { InvestmentResultsChartProps, MonthlyBreakdownItem } from '../types';

const PIE_SERIES_ID_DETAIL = 'detailPie';
const PIE_SERIES_ID_TOTAL = 'totalPie';

// Define pieDataIndexMap at a scope accessible by helper functions
const pieDataIndexMap: { [key: string]: number } = {
  'Initial Investment Amount': 0,
  'Monthly Investment Amount': 1,
  'Dividend Amount': 2,
  'Initial Investment Return': 3,
  'Monthly Investment Return': 4,
  'Dividend Return': 5
};

const totalPieSeriesNames = ['Total Invested', 'Total Return'];

export default function InvestmentResultsChart({ results }: InvestmentResultsChartProps) {
  const barChartRef = React.useRef<ReactECharts>(null);
  const pieChartRef = React.useRef<ReactECharts>(null);

  // Refs to manage interaction state
  const interactionStateRef = React.useRef<'bar_hover' | null>(null);
  const latestAxisDataIndexRef = React.useRef<number | null>(null);

  const {
    monthlyBreakdown,
  } = results;

  // Helper function to format date with tag-like styling
  const formatDateWithTag = (date: string, suffix: string = ' Breakdown') => {
    return `<span style="
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 0px 7px;
      border-radius: 10px;
      font-weight: 600;
      font-size: 1.5rem;
      margin-right: 0px;
      display: inline-block;
      box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
      vertical-align: middle;
    ">${date}</span><span style="
      font-weight: 600;
      font-size: 1.5rem;
      vertical-align: middle;
    ">${suffix}</span>`;
  };

  const updatePieChartForDate = React.useCallback((dateIndex: number, activeBarSeriesName: string | null) => {
    if (!pieChartRef.current || !monthlyBreakdown[dateIndex]) return;

    const currentData = monthlyBreakdown[dateIndex];
    const pieInstance = pieChartRef.current.getEchartsInstance();

    const newPieData = [
      { value: parseFloat(currentData.initialInvestmentAmount), name: 'Initial Investment Amount', itemStyle: { color: '#1976D2', borderRadius: 4 } },
      { value: parseFloat(currentData.monthlyInvestmentAmount), name: 'Monthly Investment Amount', itemStyle: { color: '#388E3C', borderRadius: 4 } },
      { value: parseFloat(currentData.dividendAmount), name: 'Dividend Amount', itemStyle: { color: '#F57C00', borderRadius: 4 } },
      { value: parseFloat(currentData.initialInvestmentReturn), name: 'Initial Investment Return', itemStyle: { color: 'rgba(25, 118, 210, 0.6)', borderRadius: 4 } },
      { value: parseFloat(currentData.monthlyInvestmentReturn), name: 'Monthly Investment Return', itemStyle: { color: 'rgba(56, 142, 60, 0.6)', borderRadius: 4 } },
      { value: parseFloat(currentData.dividendReturn), name: 'Dividend Return', itemStyle: { color: 'rgba(245, 124, 0, 0.6)', borderRadius: 4 } }
    ];
    const newTotalPieData = [
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

    pieInstance.setOption({
      series: [
        { id: PIE_SERIES_ID_DETAIL, data: newPieData },
        { id: PIE_SERIES_ID_TOTAL, data: newTotalPieData }
      ]
    });

    const titleElement = document.getElementById('pie-chart-title');
    if (titleElement) {
      titleElement.innerHTML = formatDateWithTag(currentData.date);
    }

    // Clear previous highlights first
    pieInstance.dispatchAction({ type: 'downplay', seriesId: PIE_SERIES_ID_DETAIL });
    pieInstance.dispatchAction({ type: 'downplay', seriesId: PIE_SERIES_ID_TOTAL });
    pieInstance.dispatchAction({ type: 'hideTip' });

    if (activeBarSeriesName) {
      const seriesNamesForPieMap = Object.keys(pieDataIndexMap);

      if (seriesNamesForPieMap.includes(activeBarSeriesName)) {
        const pieSegmentDataIndex = pieDataIndexMap[activeBarSeriesName];
        if (pieSegmentDataIndex !== undefined) {
          pieInstance.dispatchAction({ type: 'highlight', seriesId: PIE_SERIES_ID_DETAIL, dataIndex: pieSegmentDataIndex });
          pieInstance.dispatchAction({ type: 'showTip', seriesId: PIE_SERIES_ID_DETAIL, dataIndex: pieSegmentDataIndex, position: 'inside' });
        }
      } else if (totalPieSeriesNames.includes(activeBarSeriesName)) {
        const totalSegmentDataIndex = totalPieSeriesNames.indexOf(activeBarSeriesName);
        if (totalSegmentDataIndex !== -1) {
          pieInstance.dispatchAction({ type: 'highlight', seriesId: PIE_SERIES_ID_TOTAL, dataIndex: totalSegmentDataIndex });
          pieInstance.dispatchAction({ type: 'showTip', seriesId: PIE_SERIES_ID_TOTAL, dataIndex: totalSegmentDataIndex, position: 'inside' });
        }
      }
    }
  }, [monthlyBreakdown, formatDateWithTag]);


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
            'mouseover': (params: { seriesName: string; dataIndex: number; componentType: string }) => {
              // Ensure the event is from a series hover (e.g., a bar)
              if (params.componentType === 'series' && params.seriesName) {
                interactionStateRef.current = 'bar_hover';
                updatePieChartForDate(params.dataIndex, params.seriesName);
              }
            },
            'mouseout': (params: { seriesName: string; componentType: string }) => {
              if (params.componentType === 'series') {
                interactionStateRef.current = null;
                // If an axis pointer is active, update pie to that date without specific bar highlight
                if (latestAxisDataIndexRef.current !== null && monthlyBreakdown[latestAxisDataIndexRef.current]) {
                  updatePieChartForDate(latestAxisDataIndexRef.current, null);
                }
                // If no axis pointer active (e.g., mouse moved completely out),
                // 'globalout' will eventually reset to the last day.
              }
            },
            'updateAxisPointer': (params: { type: string; currTrigger?: string; dataIndex?: number; axesInfo?: Array<{axisDim: string, axisIndex: number, value: number}> }) => {
              let currentXAxisIndex: number | undefined;
               // For category axis with tooltip trigger 'axis', params.dataIndex is often the direct index.
              if (params.currTrigger === 'axis' && typeof params.dataIndex === 'number') {
                currentXAxisIndex = params.dataIndex;
              } else if (params.axesInfo && params.axesInfo[0] && params.axesInfo[0].axisDim === 'x') {
                 // Fallback or primary way for some ECharts versions/configurations
                currentXAxisIndex = params.axesInfo[0].value;
              }

              if (typeof currentXAxisIndex === 'number' && monthlyBreakdown[currentXAxisIndex]) {
                latestAxisDataIndexRef.current = currentXAxisIndex;
                if (interactionStateRef.current !== 'bar_hover') {
                  updatePieChartForDate(currentXAxisIndex, null);
                }
              }
            },
            'globalout': () => {
              interactionStateRef.current = null;
              latestAxisDataIndexRef.current = null;
              if (monthlyBreakdown.length > 0) {
                updatePieChartForDate(monthlyBreakdown.length - 1, null); // Revert to last day
              }
            },
            // Keep existing legendselectchanged if needed, or remove if it conflicts or is not desired with new logic
            'legendselectchanged': (params: { name: string; selected: { [key: string]: boolean } }) => {
              if (pieChartRef.current) {
                const lastDataIndex = monthlyBreakdown.length - 1;
                if(lastDataIndex < 0) return;

                const baseData = monthlyBreakdown[lastDataIndex];
                const pieData = [
                  { value: parseFloat(baseData.initialInvestmentAmount), name: 'Initial Investment Amount', itemStyle: { color: '#1976D2', borderRadius: 4 } },
                  { value: parseFloat(baseData.monthlyInvestmentAmount), name: 'Monthly Investment Amount', itemStyle: { color: '#388E3C', borderRadius: 4 } },
                  { value: parseFloat(baseData.dividendAmount), name: 'Dividend Amount', itemStyle: { color: '#F57C00', borderRadius: 4 } },
                  { value: parseFloat(baseData.initialInvestmentReturn), name: 'Initial Investment Return', itemStyle: { color: 'rgba(25, 118, 210, 0.6)', borderRadius: 4 } },
                  { value: parseFloat(baseData.monthlyInvestmentReturn), name: 'Monthly Investment Return', itemStyle: { color: 'rgba(56, 142, 60, 0.6)', borderRadius: 4 } },
                  { value: parseFloat(baseData.dividendReturn), name: 'Dividend Return', itemStyle: { color: 'rgba(245, 124, 0, 0.6)', borderRadius: 4 } }
                ];
                const updatedPieData = pieData.map(item => {
                  const isSelected = params.selected[item.name];
                  return {
                    ...item,
                    value: isSelected ? item.value : 0 // Keep value or set to 0 if unselected
                  };
                });

                // Similar calculation for totalPieData based on selected series
                let totalInvestedValue = 0;
                let totalReturnValue = 0;

                if (params.selected['Initial Investment Amount']) totalInvestedValue += parseFloat(baseData.initialInvestmentAmount);
                if (params.selected['Monthly Investment Amount']) totalInvestedValue += parseFloat(baseData.monthlyInvestmentAmount);
                if (params.selected['Dividend Amount']) totalInvestedValue += parseFloat(baseData.dividendAmount);

                if (params.selected['Initial Investment Return']) totalReturnValue += parseFloat(baseData.initialInvestmentReturn);
                if (params.selected['Monthly Investment Return']) totalReturnValue += parseFloat(baseData.monthlyInvestmentReturn);
                if (params.selected['Dividend Return']) totalReturnValue += parseFloat(baseData.dividendReturn);

                const updatedTotalPieData = [
                    { value: totalInvestedValue, name: 'Total Invested', itemStyle: { color: '#4B0082', borderRadius: 4 } },
                    { value: totalReturnValue, name: 'Total Return', itemStyle: { color: '#008B8B', borderRadius: 4 } }
                ];

                const pieInstance = pieChartRef.current.getEchartsInstance();
                pieInstance.setOption({
                  series: [
                    { id: PIE_SERIES_ID_DETAIL, data: updatedPieData },
                    { id: PIE_SERIES_ID_TOTAL, data: updatedTotalPieData }
                  ]
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
            color: 'primary.main'
          }}
          dangerouslySetInnerHTML={{
            __html: formatDateWithTag(monthlyBreakdown[monthlyBreakdown.length - 1].date)
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
                id: PIE_SERIES_ID_DETAIL, // Added ID
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
                id: PIE_SERIES_ID_TOTAL, // Added ID
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
                const titleElement = document.getElementById('pie-chart-title');
                if (titleElement) {
                  titleElement.innerHTML = formatDateWithTag(params.name, '');
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
                // 恢复饼状图标题为默认值（最后一天的日期）
                const titleElement = document.getElementById('pie-chart-title');
                if (titleElement) {
                  titleElement.innerHTML = formatDateWithTag(monthlyBreakdown[monthlyBreakdown.length - 1].date);
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
