"use client";
import React from 'react';
import { Typography } from '@mui/material';
import ReactECharts from 'echarts-for-react';
import WealthGrowthComparison from './WealthGrowthComparison';
import type { InvestmentResultsChartProps, MonthlyBreakdownItem } from '../types';

export default function InvestmentResultsChart({ results }: InvestmentResultsChartProps) {
  const barChartRef = React.useRef<ReactECharts>(null);
  const pieChartRef = React.useRef<ReactECharts>(null);
  const {
    monthlyBreakdown,
  } = results;


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
            my: 2,
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
                  },
                  label: {
                    show: true,
                    fontSize: 16,
                    fontWeight: 'bold',
                    color: '#FFFFFF', // 高亮时文字颜色设置为白色
                    backgroundColor: 'rgba(50, 50, 50, 0.9)', // 标签背景色为深色半透明
                    borderRadius: 5, // 圆角矩形
                    padding: [5, 10] // 内边距，上下5，左右10
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
                  },
                  label: {
                    show: true,
                    fontSize: 16,
                    fontWeight: 'bold',
                    color: '#FFFFFF', // 高亮时文字颜色设置为白色
                    backgroundColor: 'rgba(50, 50, 50, 0.9)', // 标签背景色为深色半透明
                    borderRadius: 5, // 圆角矩形
                    padding: [5, 10] // 内边距，上下5，左右10
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
