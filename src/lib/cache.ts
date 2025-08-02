// src/lib/cache.ts
import { revalidateTag } from 'next/cache';

/**
 * 缓存管理工具函数
 */
export class CacheManager {
  /**
   * 清理所有价格相关缓存
   */
  static async invalidatePriceData() {
    console.log('Invalidating price data cache...');
    
    // 清理所有价格数据相关的缓存标签
    revalidateTag('price-data');
    revalidateTag('monthly-data');
    revalidateTag('annual-returns');
    
    console.log('Price data cache invalidated');
  }

  /**
   * 清理特定标签的缓存
   */
  static async invalidateTag(tag: string) {
    console.log(`Invalidating cache tag: ${tag}`);
    revalidateTag(tag);
  }

  /**
   * 清理多个标签的缓存
   */
  static async invalidateTags(tags: string[]) {
    console.log(`Invalidating cache tags: ${tags.join(', ')}`);
    tags.forEach(tag => revalidateTag(tag));
  }
}

/**
 * 缓存键生成器
 */
export class CacheKeyGenerator {
  /**
   * 生成价格数据缓存键
   */
  static priceData(startDate?: string, endDate?: string): string {
    const start = startDate || 'all';
    const end = endDate || 'all';
    return `price-data:${start}:${end}`;
  }

  /**
   * 生成月度数据缓存键
   */
  static monthlyData(): string {
    return 'monthly-historical-data';
  }

  /**
   * 生成年化收益率缓存键
   */
  static annualReturns(): string {
    return 'annual-returns';
  }

  /**
   * 生成计算结果缓存键
   */
  static calculationResult(params: Record<string, any>): string {
    const sortedKeys = Object.keys(params).sort();
    const keyString = sortedKeys.map(key => `${key}:${params[key]}`).join('|');
    return `calc-result:${Buffer.from(keyString).toString('base64')}`;
  }
}

/**
 * 缓存配置常量
 */
export const CACHE_CONFIG = {
  // 缓存时间 (秒)
  DURATIONS: {
    PRICE_DATA: 86400,      // 24小时
    MONTHLY_DATA: 86400,    // 24小时
    ANNUAL_RETURNS: 86400,  // 24小时
    CALCULATION: 3600,      // 1小时
  },
  
  // 缓存标签
  TAGS: {
    PRICE_DATA: 'price-data',
    MONTHLY_DATA: 'monthly-data',
    ANNUAL_RETURNS: 'annual-returns',
    CALCULATION: 'calculation',
  }
} as const;
