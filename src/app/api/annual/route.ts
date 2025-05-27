import { NextResponse } from 'next/server'
import { getPriceData } from '@/lib/price'
import { calculateInvestmentGrowth } from '@/utils/investment'

export async function GET() {
  try {
    // 获取所有价格数据
    const allPriceData = await getPriceData()
    
    if (!allPriceData || allPriceData.length === 0) {
      return NextResponse.json({ success: false, err: 'No price data available' })
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
    
    // 返回结果
    return NextResponse.json({
      success: true,
      data: {
        all: (allAnnualReturn * 100).toFixed(2),
        tenYears: (tenYearAnnualReturn * 100).toFixed(2),
        fiveYears: (fiveYearAnnualReturn * 100).toFixed(2)
      }
    })
  } catch (error) {
    console.error('Error calculating annual returns:', error)
    return NextResponse.json({ success: false, err: 'Internal Server Error' })
  }
}