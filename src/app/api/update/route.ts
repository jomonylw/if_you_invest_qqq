import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import * as cheerio from 'cheerio'
import { CacheManager } from '@/lib/cache'

const prisma = new PrismaClient()

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'Connection': 'keep-alive',
  'Upgrade-Insecure-Requests': '1'
}

export async function GET() {
  try {
    // 获取历史价格数据
    console.log('Fetching historical price data...')
    const priceResponse = await fetch(`${process.env.STOCK_URL}/history/`, {
      headers: HEADERS
    })
    const priceHtml = await priceResponse.text()
    console.log('Historical price data fetched, parsing HTML...')
    const $price = cheerio.load(priceHtml)
    const priceData: { date: Date; close: number }[] = []
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    $price('div.table-wrap table tbody tr').each((index: number, element: any) => {
      const tds = $price(element).find('td')
      const dateStr = tds.eq(0).text().trim()
      const close = parseFloat(tds.eq(4).text().trim())
      
      // 转换日期格式为 YYYY-MM-DD
      const date = new Date(dateStr)
      if (!isNaN(date.getTime()) && !isNaN(close)) {
        // 确保日期格式为 YYYY-MM-DD，不考虑时区
        const year = date.getFullYear()
        const month = date.getMonth()
        const day = date.getDate()
        const formattedDate = new Date(Date.UTC(year, month, day))
        // console.log(`价格数据日期转换: 原始日期=${dateStr}, 转换后日期=${formattedDate.toISOString().split('T')[0]}`)
        priceData.push({ date: formattedDate, close })
      }
    })
    // 去掉最新的价格数据条目
    if (priceData.length > 0) {
      priceData.shift();
    }
    // console.log(priceData)
    // console.log('Fetched price data:', JSON.stringify(priceData, (key, value) => {
    //   if (key === 'date' && value instanceof Date && !isNaN(value.getTime())) {
    //     return value.toISOString().split('T')[0];
    //   }
    //   return value;
    // }, 2));
    
    // 获取股息数据
    console.log('Fetching dividend data...')
    const dividendResponse = await fetch(`${process.env.STOCK_URL}/dividend/`, {
      headers: HEADERS
    })
    const dividendHtml = await dividendResponse.text()
    console.log('Dividend data fetched, parsing HTML...')
    const $dividend = cheerio.load(dividendHtml)
    const dividendData: { exDivDate: Date; amount: number }[] = []
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    $dividend('div.table-wrap table tbody tr').each((index: number, element: any) => {
      const tds = $dividend(element).find('td')
      const exDivDateStr = tds.eq(0).text().trim()
      const amountStr = tds.eq(1).text().trim().replace('$', '')
      const amount = parseFloat(amountStr)
      
      // 转换日期格式为 YYYY-MM-DD
      const exDivDate = new Date(exDivDateStr)
      if (!isNaN(exDivDate.getTime()) && !isNaN(amount)) {
        // 确保日期格式为 YYYY-MM-DD，不考虑时区
        const year = exDivDate.getFullYear()
        const month = exDivDate.getMonth()
        const day = exDivDate.getDate()
        const formattedDate = new Date(Date.UTC(year, month, day))
        // console.log(`股息数据日期转换: 原始日期=${exDivDateStr}, 转换后日期=${formattedDate.toISOString().split('T')[0]}`)
        dividendData.push({ exDivDate: formattedDate, amount })
      }
    })
    // console.log('Fetched dividend data:', JSON.stringify(dividendData, (key, value) => {
    //   if (key === 'exDivDate' && value instanceof Date && !isNaN(value.getTime())) {
    //     return value.toISOString().split('T')[0];
    //   }
    //   return value;
    // }, 2));
    
    // 合并价格和股息数据，以收盘价数据为准
    console.log('Merging price and dividend data, prioritizing close data...')
    const mergedData: { [key: string]: { date: Date; close: number; div: number | null } } = {};
    
    // 先处理价格数据，只包含有收盘价的日期
    for (const price of priceData) {
      const dateStr = price.date.toISOString().split('T')[0];
      mergedData[dateStr] = { date: price.date, close: price.close, div: null };
    }
    
    // 再处理股息数据，只更新有收盘价的日期
    for (const dividend of dividendData) {
      const dateStr = dividend.exDivDate.toISOString().split('T')[0];
      if (mergedData[dateStr]) {
        mergedData[dateStr].div = dividend.amount;
      }
    }
    
    // 批量更新数据库
    console.log('Batch updating database with merged data...')
    const dataToUpdate = Object.values(mergedData);
    // console.log('Merged data to be updated:', JSON.stringify(dataToUpdate, (key, value) => {
    //   if (key === 'date' && value instanceof Date && !isNaN(value.getTime())) {
    //     return value.toISOString().split('T')[0];
    //   }
    //   return value;
    // }, 2));
    // 使用批量插入操作，直接插入整个数组，设置重key策略为跳过
    const dataToInsert = dataToUpdate
      .filter(item => item.close !== undefined)
      .map(item => ({
        date: item.date,
        close: item.close !== null ? item.close : 0,
        ...(item.div !== null && { div: item.div })
      }));
    
    let result;
    try {
      result = await prisma.price.createMany({
        data: dataToInsert,
        skipDuplicates: true
      });
      console.log(`Database update completed. Created: ${result.count}, Skipped: ${dataToInsert.length - result.count}`);
    } catch (error) {
      console.error('Error during batch insert:', error);
    }
    
    console.log('Database update completed.');

    // 清理相关缓存
    await CacheManager.invalidatePriceData();
    console.log('Cache invalidation completed.');

    return NextResponse.json({
      message: 'Price database updated successfully',
      length: dataToUpdate.length,
      created: result?.count || 0,
      skipped: result ? dataToInsert.length - result.count : 0
    })
  } catch (error) {
    console.error('Error updating price database:', error)
    return NextResponse.json({ error: 'Error updating price database' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}