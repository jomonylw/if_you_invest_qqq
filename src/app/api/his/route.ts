import { NextResponse } from 'next/server';
import { getPriceData } from '@/lib/price';
import type { Price } from '@prisma/client';

interface MonthlyData {
  date: string; // 月底日期 yyyy-MM-dd
  close: number; // 月底价格
  pct: number; // 当月价格变动百分比
}

export async function GET() {
  try {
    const allPriceData = await getPriceData(); // 获取所有历史数据

    if (!allPriceData || allPriceData.length === 0) {
      return NextResponse.json({ message: 'No price data available' }, { status: 404 });
    }

    const monthlyResults: MonthlyData[] = [];
    let lastMonthClose: number | null = null;

    // 按月份对数据进行分组和处理
    const pricesByMonth: Record<string, Price[]> = {};
    allPriceData.forEach(price => {
      const priceDate = new Date(price.date);
      const yearMonth = `${priceDate.getFullYear()}-${(priceDate.getMonth() + 1).toString().padStart(2, '0')}`;
      if (!pricesByMonth[yearMonth]) {
        pricesByMonth[yearMonth] = [];
      }
      pricesByMonth[yearMonth].push(price);
    });

    const sortedMonths = Object.keys(pricesByMonth).sort();

    for (const yearMonth of sortedMonths) {
      const monthPrices = pricesByMonth[yearMonth];
      // 假设数据已按日期升序排列，最后一条即为月底数据
      const endOfMonthPriceEntry = monthPrices[monthPrices.length - 1];
      const endOfMonthDate = new Date(endOfMonthPriceEntry.date);
      const endOfMonthClose = Number(endOfMonthPriceEntry.close); // Convert Decimal to number

      let pctChange = 0;
      if (lastMonthClose !== null && lastMonthClose !== 0) {
        pctChange = parseFloat(((endOfMonthClose - lastMonthClose) / lastMonthClose).toFixed(4));
      } else if (lastMonthClose === null && monthPrices.length > 0) {
        // This is the first month with data, use the first price of this month as the base
        const startOfMonthPriceEntry = monthPrices[0];
        const startOfMonthClose = Number(startOfMonthPriceEntry.close);
        if (startOfMonthClose !== 0) {
          pctChange = parseFloat(((endOfMonthClose - startOfMonthClose) / startOfMonthClose).toFixed(4));
        }
      }


      monthlyResults.push({
        date: `${endOfMonthDate.getFullYear()}-${(endOfMonthDate.getMonth() + 1).toString().padStart(2, '0')}-${endOfMonthDate.getDate().toString().padStart(2, '0')}`,
        close: endOfMonthClose,
        pct: pctChange,
      });

      lastMonthClose = endOfMonthClose;
    }

    return NextResponse.json(monthlyResults);
  } catch (error) {
    console.error('Error fetching or processing historical data:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}