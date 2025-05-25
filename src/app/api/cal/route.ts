import { NextResponse } from 'next/server';
import { getPriceData } from '../../../lib/price';
import { Price } from '@prisma/client';

interface MonthlyBreakdownItem {
  date: string;
  initialInvestmentAmount: string;
  initialInvestmentReturn: string;
  monthlyInvestmentAmount: string;
  monthlyInvestmentReturn: string;
  dividendAmount: string;
  dividendReturn: string;
  // totalInvestedCapital: string;
  // totalReturn: string;
  // totalValueWithoutDividends: string;
  // totalValue: string;
}

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

// 新增辅助函数：计算投资增长
function calculateInvestmentGrowth(
  priceData: Price[],
  initialInvestment: number,
  monthlyInvestmentDate: number | null,
  monthlyInvestmentAmount: number,
  includeDividends: boolean,
  returnMonthlyBreakdown: boolean = false // 新增参数，控制是否返回月度明细
) {
  // if (returnMonthlyBreakdown) {
  //   console.log(`CIG_DEBUG: Entry. priceData[0]?.date: ${priceData[0]?.date}, initialInvestment: ${initialInvestment}, monthlyAmtParam: ${monthlyInvestmentAmount}, monthlyDateParam: ${monthlyInvestmentDate}`);
  // }
  let cig_iteration_logger_count = 0; // Logger for first iteration details

  const firstPrice = priceData[0].close.toNumber();
  const lastPrice = priceData[priceData.length - 1].close.toNumber();
  const firstDate = new Date(priceData[0].date);

  let currentShares = initialInvestment / firstPrice;
  let totalInvested = initialInvestment;
  const initialInvestmentOriginalAmount = initialInvestment; // 初始投资的原始金额
  const initialInvestmentShares = initialInvestment / firstPrice; // 初始投资的份额

  const monthlyInvestmentTracker: { [key: string]: boolean } = {};
  const monthlyBreakdown: MonthlyBreakdownItem[] = []; // 用于存储每个月的资金情况

  const priceDataMap = new Map(priceData.map(data => [data.date, data]));
  const allDates = priceData.map(data => data.date).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());


  // 在循环外部声明这些变量，用于跟踪累计值
  let cumulativeMonthlyInvestmentOriginalAmount = 0;
  let cumulativeMonthlyInvestmentShares = 0;
  let cumulativeDividendOriginalAmount = 0;
  let cumulativeDividendReinvestedShares = 0;

  // if (returnMonthlyBreakdown) {
  //   console.log(`CIG_DEBUG: Before loop. cumulativeMonthlyInv: ${cumulativeMonthlyInvestmentOriginalAmount}, cumulativeDiv: ${cumulativeDividendOriginalAmount}`);
  // }

  for (const dateStr of allDates) {
    const data = priceDataMap.get(dateStr);
    if (!data) continue;

    const currentPrice = data.close.toNumber();
    const dividend = includeDividends ? (data.div?.toNumber() || 0) : 0;
    const currentDate = new Date(dateStr);
    const monthKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}`; // Still needed for monthlyInvestmentTracker

    // if (returnMonthlyBreakdown && cig_iteration_logger_count === 0) {
    //   console.log(`CIG_DEBUG: Loop iter 0. currentDate: ${currentDate.toISOString()}, dateStr: ${dateStr}`);
    //   console.log(`CIG_DEBUG: Loop iter 0. Before monthly inv logic. cumulativeMonthlyInv: ${cumulativeMonthlyInvestmentOriginalAmount}`);
    // }


    // Monthly investment logic
    if (monthlyInvestmentAmount > 0 && monthlyInvestmentDate !== null) {
      if (currentDate.getDate() >= monthlyInvestmentDate && !monthlyInvestmentTracker[monthKey]) {
        let performMonthlyInvestment = true;
        // Condition to skip monthly investment if it coincides with initial investment on the designated monthly investment day:
        // - There is an initial investment.
        // - Today (currentDate, which is priceData[i].date) is the very first day of available price data (i.e., firstDate, which is priceData[0].date).
        // - The designated monthlyInvestmentDate (day of the month) is set.
        // - The day of the month of this first data day (firstDate.getDate()) matches the designated monthlyInvestmentDate.
        // This prevents double investment if the user's chosen start_date (which becomes firstDate if it's the first valid data point)
        // is also their designated monthly investment day and they make an initial investment.
        if (initialInvestment > 0 &&
            currentDate.getTime() === firstDate.getTime() && // Check if current date is the first date in priceData
            monthlyInvestmentDate !== null &&
            firstDate.getDate() === monthlyInvestmentDate) { // Check if the day of the first data point matches the monthly investment day
            performMonthlyInvestment = false;
        }
        // if (returnMonthlyBreakdown && cig_iteration_logger_count === 0) {
        //   console.log(`CIG_DEBUG: Loop iter 0. performMonthlyInvestment: ${performMonthlyInvestment}`);
        // }

        if (performMonthlyInvestment) {
          const sharesBought = monthlyInvestmentAmount / currentPrice;
          currentShares += sharesBought;
          cumulativeMonthlyInvestmentShares += sharesBought; // 使用累计变量
          cumulativeMonthlyInvestmentOriginalAmount += monthlyInvestmentAmount; // 使用累计变量
          totalInvested += monthlyInvestmentAmount;
          monthlyInvestmentTracker[monthKey] = true;
        }
        // if (returnMonthlyBreakdown && cig_iteration_logger_count === 0) {
        //   console.log(`CIG_DEBUG: Loop iter 0. After monthly inv logic. cumulativeMonthlyInv: ${cumulativeMonthlyInvestmentOriginalAmount}`);
        // }
      }
    }

    // if (returnMonthlyBreakdown && cig_iteration_logger_count === 0) {
    //   console.log(`CIG_DEBUG: Loop iter 0. Before div logic. cumulativeDiv: ${cumulativeDividendOriginalAmount}, today's raw dividend value: ${dividend}`);
    // }
    // Dividend reinvestment logic
    // 股息计算应基于当日投资（如果发生）*之后*的持股数
    const sharesBeforeDividend = currentShares; // 用于计算当日股息的基数
    if (includeDividends && dividend > 0) {
      const dividendIncome = sharesBeforeDividend * dividend; // 使用当日定投前的份额计算股息
      const newSharesFromDividend = dividendIncome / currentPrice;
      currentShares += newSharesFromDividend; // 增加股息再投资的份额
      cumulativeDividendReinvestedShares += newSharesFromDividend; // 使用累计变量
      cumulativeDividendOriginalAmount += dividendIncome; // 使用累计变量
    }
    // if (returnMonthlyBreakdown && cig_iteration_logger_count === 0) {
    //   console.log(`CIG_DEBUG: Loop iter 0. After div logic. cumulativeDiv: ${cumulativeDividendOriginalAmount}`);
    // }

    // Daily breakdown logic
    if (returnMonthlyBreakdown) {
      // if (cig_iteration_logger_count === 0) {
      //   console.log(`CIG_DEBUG: Loop iter 0. Before push. monthlyAmountToPush: ${cumulativeMonthlyInvestmentOriginalAmount}, dividendAmountToPush: ${cumulativeDividendOriginalAmount}`);
      // }
      const initialInvestmentValue = initialInvestmentShares * currentPrice;
      const initialInvestmentReturn = initialInvestmentValue - initialInvestmentOriginalAmount;

      // 月度定投的回报是基于累计的定投份额和累计的定投本金
      const monthlyInvestmentValue = cumulativeMonthlyInvestmentShares * currentPrice;
      const monthlyInvestmentReturn = cumulativeMonthlyInvestmentShares > 0 ? (monthlyInvestmentValue - cumulativeMonthlyInvestmentOriginalAmount) : 0;

      // 股息再投资的回报是基于累计的股息再投资份额和累计的股息本金
      const dividendReinvestedValue = cumulativeDividendReinvestedShares * currentPrice;
      const dividendReturn = cumulativeDividendReinvestedShares > 0 ? (dividendReinvestedValue - cumulativeDividendOriginalAmount) : 0;
      
      // 总投入资本 = 初始投资 + 累计定投本金 (不应重复加股息，因为股息是收益再投资)
      // const totalInvestedCapitalForCalc = initialInvestmentOriginalAmount + cumulativeMonthlyInvestmentOriginalAmount;

      // 总价值 = 当前总份额 * 当前价格
      // const totalCurrentValue = currentShares * currentPrice;
      
      // 总回报 = 总价值 - 总投入资本 (初始 + 定投)
      // const totalReturn = totalCurrentValue - totalInvestedCapitalForCalc;

      // 不含股息的总价值 = (初始投资份额 + 累计定投份额) * 当前价格
      // const totalValueWithoutDividends = (initialInvestmentShares + cumulativeMonthlyInvestmentShares) * currentPrice;

      monthlyBreakdown.push({
        date: currentDate.toISOString().split('T')[0],
        initialInvestmentAmount: initialInvestmentOriginalAmount.toFixed(4),
        initialInvestmentReturn: initialInvestmentReturn.toFixed(4),
        monthlyInvestmentAmount: cumulativeMonthlyInvestmentOriginalAmount.toFixed(4), // 截至当日累计定投本金
        monthlyInvestmentReturn: monthlyInvestmentReturn.toFixed(4), // 累计定投回报
        dividendAmount: cumulativeDividendOriginalAmount.toFixed(4), // 截至当日累计股息本金
        dividendReturn: dividendReturn.toFixed(4), // 累计股息回报
        // totalInvestedCapital: (initialInvestmentOriginalAmount + cumulativeMonthlyInvestmentOriginalAmount).toFixed(4), // 仅初始和定投本金
        // totalReturn: totalReturn.toFixed(4),
        // totalValueWithoutDividends: totalValueWithoutDividends.toFixed(4),
        // totalValue: totalCurrentValue.toFixed(4),
      });
    }
    if (returnMonthlyBreakdown && cig_iteration_logger_count === 0) {
      cig_iteration_logger_count++;
    }
  }
  // Filter monthlyBreakdown to keep only the last entry for each month
  if (returnMonthlyBreakdown && monthlyBreakdown.length > 0) {
    const lastEntryPerMonth = new Map<string, MonthlyBreakdownItem>();
    for (const item of monthlyBreakdown) {
      // item.date is in 'YYYY-MM-DD' format from:
      // date: currentDate.toISOString().split('T')[0],
      const monthKey = item.date.substring(0, 7); // Extracts "YYYY-MM"
      lastEntryPerMonth.set(monthKey, item); // Overwrites, keeping the last one for the month
    }
    // Reconstruct monthlyBreakdown with sorted values from the map
    monthlyBreakdown.length = 0; // Clear the original array
    // Values from the map are not guaranteed to be in order, so sort them by date.
    const sortedValues = Array.from(lastEntryPerMonth.values())
                              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    monthlyBreakdown.push(...sortedValues);
  }

  const finalInvestmentValue = currentShares * lastPrice;
  return { finalInvestmentValue, totalInvested, monthlyBreakdown };
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
      return NextResponse.json({ error: 'No price data available for the given dates.' }, { status: 404 });
    }

    const firstPrice = priceData[0].close.toNumber();
    const lastPrice = priceData[priceData.length - 1].close.toNumber();
    const firstDate = new Date(priceData[0].date);
    const lastDate = new Date(priceData[priceData.length - 1].date);
    const years = (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);

    // Calculate Nominal Price Return
    const nominalPriceReturnPercentage = (lastPrice - firstPrice) / firstPrice;
    const nominalPriceReturn = nominalPriceReturnPercentage;
    const annualizedPriceReturn = years > 0 ? Math.pow(1 + nominalPriceReturnPercentage, 1 / years) - 1 : 0;

    // Calculate Nominal Price Return (with dividends reinvested) - based on unit investment
    const { finalInvestmentValue: unitInvestmentGrewToWithDividends } =
      calculateInvestmentGrowth(priceData, 1, null, 0, true); // Initial investment 1, no monthly, with dividends

    const nominalPriceReturnWithDividends = (unitInvestmentGrewToWithDividends - 1) / 1;
    const annualizedPriceReturnWithDividends = years > 0 ? Math.pow(1 + nominalPriceReturnWithDividends, 1 / years) - 1 : 0;

    // Calculate Investment Grew To (Price) - without dividends reinvested
    const { finalInvestmentValue: investmentGrewToPrice, totalInvested: totalInvestedWithoutDividends } =
      calculateInvestmentGrowth(priceData, initialInvestment, monthlyInvestmentDate, monthlyInvestmentAmount, false);

    // Calculate Nominal Total Return (without dividends reinvested)
    const nominalTotalReturnWithoutDividends = totalInvestedWithoutDividends > 0 ? (investmentGrewToPrice - totalInvestedWithoutDividends) / totalInvestedWithoutDividends : 0;
    const annualizedTotalReturnWithoutDividends = years > 0 ? Math.pow(1 + nominalTotalReturnWithoutDividends, 1 / years) - 1 : 0;

    // Calculate Nominal Total Return (with dividends reinvested)
    const { finalInvestmentValue: investmentGrewToTotalReturn, totalInvested, monthlyBreakdown } =
      calculateInvestmentGrowth(priceData, initialInvestment, monthlyInvestmentDate, monthlyInvestmentAmount, true, true); // 传入 true 以获取月度明细

    const nominalTotalReturn = totalInvested > 0 ? (investmentGrewToTotalReturn - totalInvested) / totalInvested : 0;
    const annualizedTotalReturn = years > 0 ? Math.pow(1 + nominalTotalReturn, 1 / years) - 1 : 0;

    return NextResponse.json({
      nominalPriceReturn: nominalPriceReturn.toFixed(4),
      annualizedPriceReturn: annualizedPriceReturn.toFixed(4),
      nominalPriceReturnWithDividends: nominalPriceReturnWithDividends.toFixed(4),
      annualizedPriceReturnWithDividends: annualizedPriceReturnWithDividends.toFixed(4),
      // ---
      totalInvested: totalInvested.toFixed(4),
      // ---
      nominalTotalReturnWithoutDividends: nominalTotalReturnWithoutDividends.toFixed(4),
      annualizedTotalReturnWithoutDividends: annualizedTotalReturnWithoutDividends.toFixed(4),
      investmentGrewToPrice: investmentGrewToPrice.toFixed(4),
      // ---
      nominalTotalReturn: nominalTotalReturn.toFixed(4),
      annualizedTotalReturn: annualizedTotalReturn.toFixed(4),
      investmentGrewToTotalReturn: investmentGrewToTotalReturn.toFixed(4),
      // ---
      monthlyBreakdown: monthlyBreakdown, // 添加月度明细
    });
  } catch (error) {
    console.error('Error in /api/cal:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}