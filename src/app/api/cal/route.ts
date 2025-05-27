import { NextResponse } from 'next/server';
import { getPriceData } from '../../../lib/price';
import { calculateInvestmentGrowth } from '../../../utils/investment';
import { Decimal } from '@prisma/client/runtime/library';


// 新增辅助函数：解析和验证参数
function parseAndValidateParams(searchParams: URLSearchParams): { success: boolean; err?: string; data?: { startDateParam: string | null; endDateParam: string | null; initialInvestment: number; monthlyInvestmentDate: number; monthlyInvestmentAmount: number; predictedAnnualizedReturn: number } } {
  const startDateParam = searchParams.get('start_date');
  const endDateParam = searchParams.get('end_date');
  const initialInvestmentParam = searchParams.get('initial_investment');
  const monthlyInvestmentDateParam = searchParams.get('monthly_investment_date');
  const monthlyInvestmentAmountParam = searchParams.get('monthly_investment_amount');
  const predictedAnnualizedReturnParam = searchParams.get('predicted_annualized_return');

  const initialInvestment = initialInvestmentParam ? parseFloat(initialInvestmentParam) : 0;
  const monthlyInvestmentDate = monthlyInvestmentDateParam ? parseInt(monthlyInvestmentDateParam) : 15;
  const monthlyInvestmentAmount = monthlyInvestmentAmountParam ? parseFloat(monthlyInvestmentAmountParam) : 0;
  const predictedAnnualizedReturn = predictedAnnualizedReturnParam ? parseFloat(predictedAnnualizedReturnParam) : 8;

  // 验证日期
  if (startDateParam && endDateParam) {
    const startDate = new Date(startDateParam);
    const endDate = new Date(endDateParam);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return { success: false, err: 'Invalid date format' };
    }
    if (startDate >= endDate) {
      return { success: false, err: 'Start date must be before end date' };
    }
  }

  // 验证初始投资和每月投资金额为非负数
  if (initialInvestment < 0 || monthlyInvestmentAmount < 0) {
    return { success: false, err: 'Investment amount cannot be negative' };
  }
  
  // 验证预测年化收益率不超过999
  if (predictedAnnualizedReturn > 999) {
    return { success: false, err: 'Predicted annualized return cannot exceed 999%' };
  }

  // 验证每月投资日期在合理范围内
  // if (monthlyInvestmentDate < 1 || monthlyInvestmentDate > 31) {
  //   return { success: false, err: 'Monthly investment date must be between 1 and 31' };
  // }

  return {
    success: true,
    data: {
      startDateParam,
      endDateParam,
      initialInvestment,
      monthlyInvestmentDate,
      monthlyInvestmentAmount,
      predictedAnnualizedReturn,
    }
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const validationResult = parseAndValidateParams(searchParams);
  
  if (!validationResult.success) {
    return NextResponse.json({ success: false, err: validationResult.err || 'Parameter validation failed' }, { status: 400 });
  }

  const {
    startDateParam,
    endDateParam,
    initialInvestment,
    monthlyInvestmentDate,
    monthlyInvestmentAmount,
    predictedAnnualizedReturn,
  } = validationResult.data!;

  try {
    const priceData = await getPriceData(startDateParam || undefined, endDateParam || undefined);

    if (!priceData || priceData.length === 0) {
      return NextResponse.json({ success: false, err: 'No price data available for the given dates.' }, { status: 404 });
    }

    // 如果 start_date 大于最后一条价格数据的日期，则全部使用模拟数据
    let extendedPriceData = [...priceData];
    const lastPriceDataDate = new Date(priceData[priceData.length - 1].date);
    if (startDateParam && new Date(startDateParam) > lastPriceDataDate) {
      console.log('预测逻辑触发：输入的 start_date 超出已有数据范围，将全部使用 predicted_annualized_return 进行预测');
      extendedPriceData = []; // 清空真实数据，全部使用预测数据
      
      const startDate = new Date(startDateParam);
      const endDate = endDateParam ? new Date(endDateParam) : new Date();
      const dailyRate = Math.pow(1 + predictedAnnualizedReturn / 100, 1 / 365) - 1;
      const lastPrice = priceData[priceData.length - 1].close;
      const lastDate = lastPriceDataDate;

      // 从 start_date 开始预测到 end_date
      let currentDate = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate()));
      const utcEndDate = new Date(Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate()));
      let loopCount = 0;

      while (currentDate <= utcEndDate) {
        loopCount++;
        // console.log(`循环第 ${loopCount} 次：当前日期 ${currentDate.toISOString().split('T')[0]}, 结束日期 ${utcEndDate.toISOString().split('T')[0]}`);
        
        const daysDiff = Math.floor((currentDate.getTime() - Date.UTC(lastDate.getUTCFullYear(), lastDate.getUTCMonth(), lastDate.getUTCDate())) / (1000 * 60 * 60 * 24));
        // console.log(`天数差：${daysDiff}, 预测价格计算：${Number(lastPrice)} * (1 + ${dailyRate})^${daysDiff}`);
        const predictedPrice = Number(lastPrice) * Math.pow(1 + dailyRate, daysDiff);
        // console.log(`预测价格：${predictedPrice}`);
        
        extendedPriceData.push({
          date: new Date(currentDate.getTime()),
          close: new Decimal(predictedPrice),
          div: null // 预测数据假设没有股息
        });

        // 按月推进到下个月的最后一天
        const year = currentDate.getUTCFullYear();
        const month = currentDate.getUTCMonth();
        currentDate = new Date(Date.UTC(year, month + 2, 0));
        
        console.log(`更新后日期：${currentDate.toISOString().split('T')[0]}`);
        if (loopCount > 1000) {
          console.error('预测循环次数过多，可能出现死循环，强制退出');
          break;
        }
      }

      // 如果 end_date 不是月末，添加最终预测点
      const lastPredictedDateInLoop = extendedPriceData[extendedPriceData.length - 1].date;
      if (utcEndDate.getTime() > lastPredictedDateInLoop.getTime()) {
        const daysDiff = Math.floor((utcEndDate.getTime() - Date.UTC(lastDate.getUTCFullYear(), lastDate.getUTCMonth(), lastDate.getUTCDate())) / (1000 * 60 * 60 * 24));
        console.log(`为最终 endDate 添加预测点: ${utcEndDate.toISOString().split('T')[0]}`);
        console.log(`天数差：${daysDiff}, 预测价格计算：${Number(lastPrice)} * (1 + ${dailyRate})^${daysDiff}`);
        const predictedPrice = Number(lastPrice) * Math.pow(1 + dailyRate, daysDiff);
        console.log(`预测价格：${predictedPrice}`);
        extendedPriceData.push({
          date: new Date(utcEndDate.getTime()),
          close: new Decimal(predictedPrice),
          div: null
        });
      }

      console.log(`预测完成：已添加 ${extendedPriceData.length} 个预测数据点`);
    } else if (endDateParam && new Date(endDateParam) > lastPriceDataDate) {
      console.log('预测逻辑触发：输入的 end_date 超出已有数据范围，将使用 predicted_annualized_return 进行预测');
      const lastPrice = priceData[priceData.length - 1].close;
      const lastDate = new Date(priceData[priceData.length - 1].date); // This is a local date
      const endDate = new Date(endDateParam); // This is a local date, for comparison
      const dailyRate = Math.pow(1 + predictedAnnualizedReturn / 100, 1 / 365) - 1;

      // Initialize currentDate to the last day of the month of lastDate, at UTC midnight
      let currentDate = new Date(Date.UTC(lastDate.getUTCFullYear(), lastDate.getUTCMonth() + 1, 0));

      let loopCount = 0;
      // Ensure endDate for comparison is also treated as UTC midnight for consistency
      const utcEndDate = new Date(Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate()));

      while (currentDate <= utcEndDate) {
        loopCount++;
        // Log UTC date string
        console.log(`循环第 ${loopCount} 次：当前日期 ${currentDate.toISOString().split('T')[0]}, 结束日期 ${utcEndDate.toISOString().split('T')[0]}`);
        
        // Calculate daysDiff based on UTC dates
        const daysDiff = Math.floor((currentDate.getTime() - Date.UTC(lastDate.getUTCFullYear(), lastDate.getUTCMonth(), lastDate.getUTCDate())) / (1000 * 60 * 60 * 24));
        console.log(`天数差：${daysDiff}, 预测价格计算：${Number(lastPrice)} * (1 + ${dailyRate})^${daysDiff}`);
        const predictedPrice = Number(lastPrice) * Math.pow(1 + dailyRate, daysDiff);
        console.log(`预测价格：${predictedPrice}`);
        
        extendedPriceData.push({
          date: new Date(currentDate.getTime()), // Store a new Date object representing this UTC moment
          close: new Decimal(predictedPrice),
          div: null // 预测数据假设没有股息
        });

        // Advance currentDate to the last day of the next month, at UTC midnight
        const year = currentDate.getUTCFullYear();
        const month = currentDate.getUTCMonth();
        currentDate = new Date(Date.UTC(year, month + 2, 0));
        
        // Log UTC date string
        console.log(`更新后日期：${currentDate.toISOString().split('T')[0]}`);
        // 添加安全机制，防止无限循环
        if (loopCount > 1000) {
          console.error('预测循环次数过多，可能出现死循环，强制退出');
          break;
        }
      }

      // Add a final prediction point for the exact utcEndDate if it's not already the last day of a month
      const lastPredictedDateInLoop = extendedPriceData[extendedPriceData.length -1].date;
      if (utcEndDate.getTime() > lastPredictedDateInLoop.getTime()) {
        const daysDiff = Math.floor((utcEndDate.getTime() - Date.UTC(lastDate.getUTCFullYear(), lastDate.getUTCMonth(), lastDate.getUTCDate())) / (1000 * 60 * 60 * 24));
        console.log(`为最终 endDate 添加预测点: ${utcEndDate.toISOString().split('T')[0]}`);
        console.log(`天数差：${daysDiff}, 预测价格计算：${Number(lastPrice)} * (1 + ${dailyRate})^${daysDiff}`);
        const predictedPrice = Number(lastPrice) * Math.pow(1 + dailyRate, daysDiff);
        console.log(`预测价格：${predictedPrice}`);
        extendedPriceData.push({
          date: new Date(utcEndDate.getTime()),
          close: new Decimal(predictedPrice),
          div: null
        });
      }

      console.log(`预测完成：已添加 ${extendedPriceData.length - priceData.length} 个预测数据点`);
    }
    
    const { nominalReturn: nominalPriceReturn, annualizedReturn: annualizedPriceReturn } =
      calculateInvestmentGrowth(extendedPriceData, 1, null, 0, false); // Initial investment 1, no monthly, without dividends
      
    const { nominalReturn: nominalPriceReturnWithDividends, annualizedReturn: annualizedPriceReturnWithDividends } =
      calculateInvestmentGrowth(extendedPriceData, 1, null, 0, true); // Initial investment 1, no monthly, with dividends

    const { finalInvestmentValue: investmentGrewToPrice, nominalReturn: nominalTotalReturnWithoutDividends, annualizedReturn: annualizedTotalReturnWithoutDividends } =
      calculateInvestmentGrowth(extendedPriceData, initialInvestment, monthlyInvestmentDate, monthlyInvestmentAmount, false);

    const { finalInvestmentValue: investmentGrewToTotalReturn, totalInvested, nominalReturn: nominalTotalReturn, annualizedReturn: annualizedTotalReturn, monthlyBreakdown } =
      calculateInvestmentGrowth(extendedPriceData, initialInvestment, monthlyInvestmentDate, monthlyInvestmentAmount, true, true); // 传入 true 以获取月度明细


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
        predictedAnnualizedReturn: predictedAnnualizedReturn.toFixed(4), // 预测年化收益率
        //----
        monthlyBreakdown: monthlyBreakdown, // 每月投资明细
      }
    });
  } catch (error) {
    console.error('Error in /api/cal:', error);
    return NextResponse.json({ success: false, err: 'Internal Server Error' }, { status: 500 });
  }
}