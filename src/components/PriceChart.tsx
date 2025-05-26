"use client";
import ReactECharts from 'echarts-for-react';
import { useEffect, useState, useCallback } from "react";
import type { EChartsOption, DataZoomComponentOption } from 'echarts';
import { format, parseISO, lastDayOfMonth, subMonths, isLastDayOfMonth } from 'date-fns';
import type { HisData, DataZoomEventParamsDetail, DataZoomEventParams, PriceChartProps } from '../types';

export default function PriceChart({ calFormStartDate, calFormEndDate, onDatesChange }: PriceChartProps) {
  const [chartOption, setChartOption] = useState<EChartsOption | null>(null);
  const [allDates, setAllDates] = useState<string[]>([]);
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
          const localDates = data.map(item => item.date);
          setAllDates(localDates);
          const closes = data.map(item => item.close);
          const pcts = data.map(item => ({
            value: item.pct,
            itemStyle: {
              color: item.pct >= 0 ? '#00ff00' : '#ff0000'
            }
          }));

          let minPctValue = Infinity;
          let maxPctValue = -Infinity;
          if (pcts.length > 0) {
            pcts.forEach(p => {
              if (p.value < minPctValue) minPctValue = p.value;
              if (p.value > maxPctValue) maxPctValue = p.value;
            });
          } else {
            minPctValue = -0.01;
            maxPctValue = 0.01;
          }

          let yMinPct, yMaxPct;
          const absoluteMaxPct = Math.max(Math.abs(minPctValue), Math.abs(maxPctValue));

          if (absoluteMaxPct === 0) {
            yMinPct = -0.01;
            yMaxPct = 0.01;
          } else {
            yMaxPct = absoluteMaxPct * 1.1;
            yMinPct = -absoluteMaxPct * 1.1;
          }

          let initialStartPercent = 0;
          let initialEndPercent = 100;

          if (localDates.length > 0) {
            const initialStartDateIndex = localDates.indexOf(calFormStartDate);
            const initialEndDateIndex = localDates.indexOf(calFormEndDate);

            if (initialStartDateIndex !== -1 && initialEndDateIndex !== -1 && initialStartDateIndex <= initialEndDateIndex) {
              if (localDates.length > 1) {
                initialStartPercent = (initialStartDateIndex / (localDates.length - 1)) * 100;
                initialEndPercent = (initialEndDateIndex / (localDates.length - 1)) * 100;
              } else {
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
              show: false,
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
                bottom: 10,
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
                      if (numericValue !== undefined) {
                        return '$ ' + numericValue.toFixed(2);
                      }
                      return String(params.value);
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
                      if (numericValue !== undefined) {
                        return (numericValue * 100).toFixed(2) + ' %';
                      }
                      return String(params.value);
                    }
                  }
                },
                splitLine: {
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
  }, [calFormStartDate, calFormEndDate]); // Dependencies for re-initializing chart

  const handleDataZoom = useCallback((params: DataZoomEventParams) => {
    if (allDates.length > 0 && params) {
      let eventDetailSource: DataZoomEventParamsDetail | null = null;

      if (params.batch && params.batch.length > 0 && params.batch[0]) {
        eventDetailSource = params.batch[0];
      } else if (typeof params.start === 'number' && typeof params.end === 'number') {
        eventDetailSource = params as DataZoomEventParamsDetail;
      }

      if (eventDetailSource && typeof eventDetailSource.start === 'number' && typeof eventDetailSource.end === 'number') {
        const startPercent = eventDetailSource.start;
        const endPercent = eventDetailSource.end;

        const len = allDates.length;
        if (len === 0) return;

        const startIndex = Math.round((startPercent / 100) * (len - 1));
        const endIndex = Math.round((endPercent / 100) * (len - 1));

        const validStartIndex = Math.max(0, Math.min(startIndex, len - 1));
        const validEndIndex = Math.max(0, Math.min(endIndex, len - 1));

        if (allDates[validStartIndex] && allDates[validEndIndex] && validStartIndex <= validEndIndex) {
          const newStartDate = allDates[validStartIndex];
          const newEndDate = allDates[validEndIndex];

          if (calFormStartDate !== newStartDate || calFormEndDate !== newEndDate) {
            onDatesChange(newStartDate, newEndDate);
          }
        }
      }
    }
  }, [allDates, calFormStartDate, calFormEndDate, onDatesChange]);

  useEffect(() => {
    if (allDates.length > 0 && chartOption) {
      let effectiveZoomStartDateStr: string | undefined = undefined;
      let effectiveZoomEndDateStr: string | undefined = undefined;

      if (calFormStartDate) {
        try {
          const startDateObj = parseISO(calFormStartDate);
          const prevMonthLastDayObj = lastDayOfMonth(subMonths(startDateObj, 1));
          const targetStart = format(prevMonthLastDayObj, 'yyyy-MM-dd');
          
          for (let i = allDates.length - 1; i >= 0; i--) {
            if (allDates[i] <= targetStart) {
              effectiveZoomStartDateStr = allDates[i];
              break;
            }
          }
          if (!effectiveZoomStartDateStr && allDates.length > 0) {
            effectiveZoomStartDateStr = allDates[0];
          }
        } catch (e) {
          console.error("Error processing start_date for dataZoom sync:", e);
          if (allDates.length > 0) effectiveZoomStartDateStr = allDates[0];
        }
      } else if (allDates.length > 0) {
        effectiveZoomStartDateStr = allDates[0];
      }

      if (calFormEndDate) {
        try {
          const endDateObj = parseISO(calFormEndDate);
          const currentMonthLastDayObj = lastDayOfMonth(endDateObj);
          const targetEndCurrentMonth = format(currentMonthLastDayObj, 'yyyy-MM-dd');

          if (allDates.includes(targetEndCurrentMonth)) {
            effectiveZoomEndDateStr = targetEndCurrentMonth;
          } else {
            for (let i = allDates.length - 1; i >= 0; i--) {
              if (allDates[i] <= calFormEndDate) {
                const d = parseISO(allDates[i]);
                if (isLastDayOfMonth(d)) {
                  effectiveZoomEndDateStr = allDates[i];
                  break;
                }
              }
            }
            if (!effectiveZoomEndDateStr) {
              for (let i = allDates.length - 1; i >= 0; i--) {
                if (allDates[i] <= calFormEndDate) {
                  effectiveZoomEndDateStr = allDates[i];
                  break;
                }
              }
            }
          }
          if (!effectiveZoomEndDateStr && allDates.length > 0) {
             effectiveZoomEndDateStr = allDates[allDates.length -1];
          }
        } catch (e) {
          console.error("Error processing end_date for dataZoom sync:", e);
          if (allDates.length > 0) effectiveZoomEndDateStr = allDates[allDates.length - 1];
        }
      } else if (allDates.length > 0) {
        effectiveZoomEndDateStr = allDates[allDates.length - 1];
      }
      
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
          } else {
            newStartPercent = 0;
            newEndPercent = 100;
          }

          newStartPercent = Math.max(0, Math.min(100, newStartPercent));
          newEndPercent = Math.max(0, Math.min(100, newEndPercent));
          if (newStartPercent > newEndPercent) newEndPercent = newStartPercent;
          
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
              return prevOption;
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
  }, [calFormStartDate, calFormEndDate, allDates, chartOption, setChartOption]);

  const onEvents = {
    'datazoom': handleDataZoom,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height: '600px' }}>
        Loading chart data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center text-red-500" style={{ height: '600px' }}>
        Error loading chart: {error}
      </div>
    );
  }

  return (
    <>
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
    </>
  );
}