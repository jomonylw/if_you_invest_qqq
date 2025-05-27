import { NextResponse } from 'next/server';
import { getPriceData } from '../../../lib/price';
import { calculateInvestmentGrowth } from '../../../utils/investment';


// 新增辅助函数：解析和验证参数
function parseAndValidateParams(searchParams: URLSearchParams) {
  const startDateParam = searchParams.get('start_date');
  const endDateParam = searchParams.get('end_date');
  const initialInvestmentParam = searchParams.get('initial_investment');
  const monthlyInvestmentDateParam = searchParams.get('monthly_investment_date');
  const monthlyInvestmentAmountParam = searchParams.get('monthly_investment_amount');

  const initialInvestment = initialInvestmentParam ? parseFloat(initialInvestmentParam) : 0;
  const monthlyInvestmentDate = monthlyInvestmentDateParam ? parseInt(monthlyInvestmentDateParam) : null;
  const monthlyInvestmentAmount = monthlyInvestmentAmountParam ? parseFloat(monthlyInvestmentAmountParam) : 0;

  return {
    startDateParam,
    endDateParam,
    initialInvestment,
    monthlyInvestmentDate,
    monthlyInvestmentAmount,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const {
    startDateParam,
    endDateParam,
    initialInvestment,
    monthlyInvestmentDate,
    monthlyInvestmentAmount,
  } = parseAndValidateParams(searchParams);

  try {
    const priceData = await getPriceData(startDateParam || undefined, endDateParam || undefined);

    if (!priceData || priceData.length === 0) {
      return NextResponse.json({ success: false, err: 'No price data available for the given dates.' }, { status: 404 });
    }
    
    const { nominalReturn: nominalPriceReturn , annualizedReturn: annualizedPriceReturn } =
      calculateInvestmentGrowth(priceData, 1, null, 0, false); // Initial investment 1, no monthly, with dividends
      
    const { nominalReturn: nominalPriceReturnWithDividends, annualizedReturn: annualizedPriceReturnWithDividends } =
      calculateInvestmentGrowth(priceData, 1, null, 0, true); // Initial investment 1, no monthly, with dividends

    const { finalInvestmentValue: investmentGrewToPrice, nominalReturn: nominalTotalReturnWithoutDividends, annualizedReturn: annualizedTotalReturnWithoutDividends } =
      calculateInvestmentGrowth(priceData, initialInvestment, monthlyInvestmentDate, monthlyInvestmentAmount, false);

    const { finalInvestmentValue: investmentGrewToTotalReturn, totalInvested, nominalReturn: nominalTotalReturn, annualizedReturn: annualizedTotalReturn, monthlyBreakdown } =
      calculateInvestmentGrowth(priceData, initialInvestment, monthlyInvestmentDate, monthlyInvestmentAmount, true, true); // 传入 true 以获取月度明细


    return NextResponse.json({
      success: true,
      data: {
        nominalPriceReturn: nominalPriceReturn.toFixed(4), // 名义价格回报率（仅考虑价格变化，不含股息）
        annualizedPriceReturn: annualizedPriceReturn.toFixed(4), // 年化价格回报率（仅考虑价格变化，不含股息）
        //----
        nominalPriceReturnWithDividends: nominalPriceReturnWithDividends.toFixed(4), // 名义价格回报率（基于单位初始投资，考虑股息再投资）
        annualizedPriceReturnWithDividends: annualizedPriceReturnWithDividends.toFixed(4), // 年化价格回报率（基于单位初始投资，衡量标的自身表现，考虑股息再投资）
        //----
        totalInvested: totalInvested.toFixed(4), // 总投入资本（初始投资 + 历次定投本金）
        //----
        nominalTotalReturnWithoutDividends: nominalTotalReturnWithoutDividends.toFixed(4), // 名义总回报率（基于总投入资本，不含股息）
        annualizedTotalReturnWithoutDividends: annualizedTotalReturnWithoutDividends.toFixed(4), // 年化总回报率（基于总投入资本，不含股息）
        investmentGrewToPrice: investmentGrewToPrice.toFixed(4), // 投资增长至的最终价值（基于总投入资本，仅价格变动，不含股息）
        //----
        nominalTotalReturn: nominalTotalReturn.toFixed(4), // 名义总回报率（基于总投入资本，含股息再投资）
        annualizedTotalReturn: annualizedTotalReturn.toFixed(4), // 年化总回报率（基于总投入资本，衡量整体投资策略表现，含股息再投资）
        investmentGrewToTotalReturn: investmentGrewToTotalReturn.toFixed(4), // 投资增长至的最终价值（含股息再投资）
        //----
        monthlyBreakdown: monthlyBreakdown, // 每月投资明细
      }
    });
  } catch (error) {
    console.error('Error in /api/cal:', error);
    return NextResponse.json({ success: false, err: 'Internal Server Error' }, { status: 500 });
  }
}