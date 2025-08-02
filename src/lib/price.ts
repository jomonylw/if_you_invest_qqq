// src/lib/price.ts
import { PrismaClient } from '@prisma/client';
import { unstable_cache } from 'next/cache';
import { PerformanceMonitor } from './performance';
import { CacheMonitor } from './cache-monitor';

const prisma = new PrismaClient();

/**
 * 包装 unstable_cache 以添加监控功能
 */
function monitoredCache<T>(
  fn: () => Promise<T>,
  keys: string[],
  options: { revalidate: number; tags: string[] },
  cacheKey: string
) {
  const cachedFn = unstable_cache(fn, keys, options);

  return async (): Promise<T> => {
    const startTime = Date.now();

    try {
      const result = await cachedFn();
      const duration = Date.now() - startTime;

      // 判断是否为缓存命中（通常缓存命中会很快）
      if (duration < 50) {
        CacheMonitor.recordHit(cacheKey, duration);
      } else {
        CacheMonitor.recordMiss(cacheKey, duration);
        // 记录数据大小（如果是数组）
        if (Array.isArray(result)) {
          const dataSize = JSON.stringify(result).length;
          CacheMonitor.recordSet(cacheKey, dataSize);
        }
      }

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      CacheMonitor.recordMiss(cacheKey, duration);
      throw error;
    }
  };
}

// 使用监控包装的缓存函数
const getCachedAllPriceData = monitoredCache(
  async () => {
    return PerformanceMonitor.measure('database-fetch-all-price-data', async () => {
      console.log('Cache miss - Fetching all price data from database...');
      let attempts = 0;
      const maxRetries = 3;
      const retryDelayMs = 1000;

      while (attempts < maxRetries) {
        try {
          const allPriceData = await prisma.price.findMany({
            orderBy: {
              date: 'asc',
            },
          });
          console.log(`All price data fetched and cached. ${allPriceData.length} records.`);
          return allPriceData;
        } catch (error) {
          attempts++;
          console.error(`Error fetching all price data (attempt ${attempts}/${maxRetries}):`, error);
          if (attempts >= maxRetries) {
            console.error('Max retries reached. Failed to fetch price data.');
            throw error;
          }
          await new Promise(resolve => setTimeout(resolve, retryDelayMs));
        }
      }
      return [];
    });
  },
  ['all-price-data'], // 缓存键
  {
    revalidate: 86400, // 24小时缓存
    tags: ['price-data'], // 缓存标签，用于手动失效
  },
  'all-price-data' // 监控键
);

// 初始化缓存监控（仅开发环境）
if (process.env.NODE_ENV === 'development') {
  CacheMonitor.startPeriodicReporting(30000); // 每30秒报告一次
}

export async function getPriceData(startDate?: string, endDate?: string) {
  const defaultStartDate = new Date('1990-01-01T00:00:00.000Z');
  const defaultEndDate = new Date();

  const queryStartDate = startDate ? new Date(startDate) : defaultStartDate;
  const queryEndDate = endDate ? new Date(endDate) : defaultEndDate;

  try {
    const startTime = Date.now();

    // 从缓存获取所有数据
    console.log('Getting cached price data...');
    const allPriceData = await getCachedAllPriceData();

    const duration = Date.now() - startTime;
    // 如果很快返回，说明是缓存命中
    if (duration < 50) {
      CacheMonitor.recordHit('all-price-data', duration);
    }

    if (!allPriceData || allPriceData.length === 0) {
      console.log('No price data available');
      return [];
    }

    // 在内存中过滤数据
    const filteredData = allPriceData.filter(price => {
      const priceDate = new Date(price.date);
      return priceDate >= queryStartDate && priceDate <= queryEndDate;
    });

    console.log(`Returning ${filteredData.length} records for the period ${queryStartDate.toISOString().split('T')[0]} to ${queryEndDate.toISOString().split('T')[0]}`);
    return filteredData;
  } catch (error) {
    console.error('Error in getPriceData:', error);
    throw error;
  } finally {
    // 在 serverless 环境中，通常不需要手动断开连接
    // Prisma 会自动管理连接池
  }
}