import { NextResponse } from 'next/server'
import { getPriceData } from '@/lib/price'
import { calculateInvestmentGrowth } from '@/utils/investment'
import { unstable_cache } from 'next/cache'
import { CacheMonitor } from '@/lib/cache-monitor'

// 缓存年化收益率计算
const getCachedAnnualReturns = unstable_cache(
  async () => {
    const startTime = Date.now();
    console.log('Cache miss - Calculating annual returns...');

    // 获取所有价格数据
    const allPriceData = await getPriceData()

    if (!allPriceData || allPriceData.length === 0) {
      throw new Error('No price data available')
    }

    // 获取最后一个价格日期
    const lastDate = new Date(allPriceData[allPriceData.length - 1].date)

    // 计算全部数据的年度回报率
    const allDataResult = calculateInvestmentGrowth(allPriceData, 1, null, 0, true)
    const allAnnualReturn = allDataResult.annualizedReturn

    // 计算过去10年的年度回报率
    const tenYearsAgo = new Date(lastDate)
    tenYearsAgo.setFullYear(lastDate.getFullYear() - 10)
    const tenYearData = allPriceData.filter(price => new Date(price.date) >= tenYearsAgo)
    let tenYearAnnualReturn = 0
    if (tenYearData.length > 0) {
      const tenYearResult = calculateInvestmentGrowth(tenYearData, 1, null, 0, true)
      tenYearAnnualReturn = tenYearResult.annualizedReturn
    }

    // 计算过去5年的年度回报率
    const fiveYearsAgo = new Date(lastDate)
    fiveYearsAgo.setFullYear(lastDate.getFullYear() - 5)
    const fiveYearData = allPriceData.filter(price => new Date(price.date) >= fiveYearsAgo)
    let fiveYearAnnualReturn = 0
    if (fiveYearData.length > 0) {
      const fiveYearResult = calculateInvestmentGrowth(fiveYearData, 1, null, 0, true)
      fiveYearAnnualReturn = fiveYearResult.annualizedReturn
    }

    const result = {
      all: (allAnnualReturn * 100).toFixed(2),
      tenYears: (tenYearAnnualReturn * 100).toFixed(2),
      fiveYears: (fiveYearAnnualReturn * 100).toFixed(2)
    };

    const duration = Date.now() - startTime;
    CacheMonitor.recordMiss('annual-returns', duration);
    const dataSize = JSON.stringify(result).length;
    CacheMonitor.recordSet('annual-returns', dataSize);

    return result;
  },
  ['annual-returns'], // 缓存键
  {
    revalidate: 86400, // 24小时缓存
    tags: ['annual-returns', 'price-data'], // 缓存标签
  }
);

export async function GET() {
  try {
    const startTime = Date.now();

    // 从缓存获取年化收益率数据
    const data = await getCachedAnnualReturns();

    const duration = Date.now() - startTime;
    // 如果很快返回，说明是缓存命中
    if (duration < 50) {
      CacheMonitor.recordHit('annual-returns', duration);
    }

    const response = NextResponse.json({
      success: true,
      data
    });

    // 添加HTTP缓存头
    response.headers.set('Cache-Control', 'public, max-age=86400, s-maxage=86400');
    response.headers.set('CDN-Cache-Control', 'public, max-age=86400');
    response.headers.set('Vercel-CDN-Cache-Control', 'public, max-age=86400');

    return response;
  } catch (error) {
    console.error('Error calculating annual returns:', error)
    return NextResponse.json({ success: false, err: 'Internal Server Error' }, { status: 500 })
  }
}