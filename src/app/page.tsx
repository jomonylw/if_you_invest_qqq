"use client";
import Image from "next/image";
import ReactECharts from 'echarts-for-react';
import { useEffect, useState } from "react";
import type { EChartsOption } from 'echarts';

interface HisData {
  date: string;
  close: number;
  pct: number;
}

export default function Home() {
  const [chartOption, setChartOption] = useState<EChartsOption | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          const dates = data.map(item => item.date);
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

          let yMinPct, yMaxPct;
          const pctRange = maxPctValue - minPctValue;

          if (pctRange === 0) {
            // Handle cases where all data points are the same
            yMinPct = minPctValue === 0 ? -0.01 : minPctValue - Math.abs(minPctValue * 0.1);
            yMaxPct = maxPctValue === 0 ? 0.01 : maxPctValue + Math.abs(maxPctValue * 0.1);
          } else {
            yMinPct = minPctValue - pctRange * 0.05; // Add 5% padding below min
            yMaxPct = maxPctValue + pctRange * 0.05; // Add 5% padding above max
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
              feature: {
                dataView: { show: true, readOnly: false },
                magicType: { show: true, type: ['line', 'bar'] },
                restore: { show: true },
                saveAsImage: { show: true }
              }
            },
            legend: {
              data: ['Close Price', 'Change Pct']
            },
            dataZoom: [
              {
                type: 'slider',
                show: true,
                xAxisIndex: [0],
                start: 0, // 默认从头开始
                end: 100,  // 默认显示全部
                bottom: 10 // 距离底部的距离
              },
              {
                type: 'inside',
                xAxisIndex: [0],
                start: 0,
                end: 100
              }
            ],
            xAxis: [
              {
                type: 'category',
                data: dates,
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
                }
              },
              {
                type: 'value',
                name: 'Change Pct',
                alignTicks: true,
                min: yMinPct,
                max: yMaxPct,
                axisLabel: {
                  formatter: function (value: number) {
                    return (value * 100).toFixed(2) + ' %';
                  }
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
                name: 'Change Pct',
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
  }, []);

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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">QQQ Historical Data</h1>
      {chartOption && (
        <ReactECharts
          option={chartOption}
          style={{ height: '600px', width: '100%' }}
          notMerge={true}
          lazyUpdate={true}
        />
      )}
       <footer className="mt-8 text-center text-sm text-gray-500">
        <p>Data fetched from /api/his</p>
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
  );
}
