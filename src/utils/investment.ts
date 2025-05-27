import { Price } from '@prisma/client';

interface MonthlyBreakdownItem {
  date: string;
  initialInvestmentAmount: string;
  initialInvestmentReturn: string;
  monthlyInvestmentAmount: string;
  monthlyInvestmentReturn: string;
  dividendAmount: string;
  dividendReturn: string;
}

/**
 * 计算投资增长
 * @param priceData 价格数据数组
 * @param initialInvestment 初始投资金额
 * @param monthlyInvestmentDate 每月投资日期
 * @param monthlyInvestmentAmount 每月投资金额
 * @param includeDividends 是否包含股息
 * @param returnMonthlyBreakdown 是否返回月度明细
 * @returns 投资增长结果
 */
export function calculateInvestmentGrowth(
  priceData: Price[],
  initialInvestment: number,
  monthlyInvestmentDate: number | null,
  monthlyInvestmentAmount: number,
  includeDividends: boolean,
  returnMonthlyBreakdown: boolean = false
) {
  let cig_iteration_logger_count = 0;

  const firstPrice = priceData[0].close.toNumber();
  const lastPrice = priceData[priceData.length - 1].close.toNumber();
  const firstDate = new Date(priceData[0].date);

  let currentShares = initialInvestment / firstPrice;
  let totalInvested = initialInvestment;
  const initialInvestmentOriginalAmount = initialInvestment;
  const initialInvestmentShares = initialInvestment / firstPrice;

  const monthlyInvestmentTracker: { [key: string]: boolean } = {};
  const monthlyBreakdown: MonthlyBreakdownItem[] = [];

  const priceDataMap = new Map(priceData.map(data => [data.date, data]));
  const allDates = priceData.map(data => data.date).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  const monthlyLastTradingDayCache = new Map<string, Date>();
  if (allDates.length > 0) {
    allDates.forEach(dateStr => {
        const d = new Date(dateStr);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        monthlyLastTradingDayCache.set(key, d);
    });
  }

  let cumulativeMonthlyInvestmentOriginalAmount = 0;
  let cumulativeMonthlyInvestmentShares = 0;
  let cumulativeDividendOriginalAmount = 0;
  let cumulativeDividendReinvestedShares = 0;

  for (const dateStr of allDates) {
    const data = priceDataMap.get(dateStr);
    if (!data) continue;

    const currentPrice = data.close.toNumber();
    const dividend = includeDividends ? (data.div?.toNumber() || 0) : 0;
    const currentDate = new Date(dateStr);
    const monthKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}`;

    if (monthlyInvestmentAmount > 0 && monthlyInvestmentDate !== null) {
      let performInvestmentCheck = false;
      const lastTradingDayDateObj = monthlyLastTradingDayCache.get(monthKey);

      if (lastTradingDayDateObj) {
        const lastActualTradingDayOfMonth = lastTradingDayDateObj.getDate();
        if (monthlyInvestmentDate > lastActualTradingDayOfMonth) {
          if (currentDate.getDate() === lastActualTradingDayOfMonth) {
            performInvestmentCheck = true;
          }
        } else {
          if (currentDate.getDate() >= monthlyInvestmentDate) {
            performInvestmentCheck = true;
          }
        }
      } else {
        if (currentDate.getDate() >= monthlyInvestmentDate) {
          performInvestmentCheck = true;
        }
      }

      if (performInvestmentCheck && !monthlyInvestmentTracker[monthKey]) {
        let performMonthlyInvestment = true;
        if (initialInvestment > 0 &&
            currentDate.getTime() === firstDate.getTime() &&
            monthlyInvestmentDate !== null &&
            firstDate.getDate() === monthlyInvestmentDate) {
            performMonthlyInvestment = false;
        }

        if (performMonthlyInvestment) {
          const sharesBought = monthlyInvestmentAmount / currentPrice;
          currentShares += sharesBought;
          cumulativeMonthlyInvestmentShares += sharesBought;
          cumulativeMonthlyInvestmentOriginalAmount += monthlyInvestmentAmount;
          totalInvested += monthlyInvestmentAmount;
          monthlyInvestmentTracker[monthKey] = true;
        }
      }
    }

    const sharesBeforeDividend = currentShares;
    if (includeDividends && dividend > 0) {
      const dividendIncome = sharesBeforeDividend * dividend;
      const newSharesFromDividend = dividendIncome / currentPrice;
      currentShares += newSharesFromDividend;
      cumulativeDividendReinvestedShares += newSharesFromDividend;
      cumulativeDividendOriginalAmount += dividendIncome;
    }

    if (returnMonthlyBreakdown) {
      const initialInvestmentValue = initialInvestmentShares * currentPrice;
      const initialInvestmentReturn = initialInvestmentValue - initialInvestmentOriginalAmount;

      const monthlyInvestmentValue = cumulativeMonthlyInvestmentShares * currentPrice;
      const monthlyInvestmentReturn = cumulativeMonthlyInvestmentShares > 0 ? (monthlyInvestmentValue - cumulativeMonthlyInvestmentOriginalAmount) : 0;

      const dividendReinvestedValue = cumulativeDividendReinvestedShares * currentPrice;
      const dividendReturn = cumulativeDividendReinvestedShares > 0 ? (dividendReinvestedValue - cumulativeDividendOriginalAmount) : 0;
      
      monthlyBreakdown.push({
        date: currentDate.toISOString().split('T')[0],
        initialInvestmentAmount: initialInvestmentOriginalAmount.toFixed(4),
        initialInvestmentReturn: initialInvestmentReturn.toFixed(4),
        monthlyInvestmentAmount: cumulativeMonthlyInvestmentOriginalAmount.toFixed(4),
        monthlyInvestmentReturn: monthlyInvestmentReturn.toFixed(4),
        dividendAmount: cumulativeDividendOriginalAmount.toFixed(4),
        dividendReturn: dividendReturn.toFixed(4),
      });
    }
    if (returnMonthlyBreakdown && cig_iteration_logger_count === 0) {
      cig_iteration_logger_count++;
    }
  }

  if (returnMonthlyBreakdown && monthlyBreakdown.length > 0) {
    const lastEntryPerMonth = new Map<string, MonthlyBreakdownItem>();
    for (const item of monthlyBreakdown) {
      const monthKey = item.date.substring(0, 7);
      lastEntryPerMonth.set(monthKey, item);
    }
    monthlyBreakdown.length = 0;
    const sortedValues = Array.from(lastEntryPerMonth.values())
                              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    monthlyBreakdown.push(...sortedValues);
  }
    
  const finalInvestmentValue = currentShares * lastPrice;
  const startDate = new Date(priceData[0].date);
  const endDate = new Date(priceData[priceData.length - 1].date);
  const years = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  const nominalReturn = totalInvested > 0 ? (finalInvestmentValue - totalInvested) / totalInvested : 0;
  const annualizedReturn = years > 0 ? Math.pow(1 + nominalReturn, 1 / years) - 1 : 0;
  
  return { finalInvestmentValue, totalInvested, nominalReturn, annualizedReturn, monthlyBreakdown };
}