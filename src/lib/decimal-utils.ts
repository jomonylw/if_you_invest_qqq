// src/lib/decimal-utils.ts
import { Decimal } from '@prisma/client/runtime/library';

/**
 * 安全地将各种数值类型转换为 number
 * 处理 Prisma Decimal、普通数字、字符串等
 */
export function toNumber(value: any): number {
  // 如果已经是数字，直接返回
  if (typeof value === 'number') {
    return value;
  }
  
  // 如果是字符串，尝试解析
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  
  // 如果是 Prisma Decimal 对象（有 toNumber 方法）
  if (value && typeof value.toNumber === 'function') {
    return value.toNumber();
  }
  
  // 如果是序列化后的 Decimal（可能有 toString 方法）
  if (value && typeof value === 'object' && 'toString' in value) {
    const parsed = parseFloat(value.toString());
    return isNaN(parsed) ? 0 : parsed;
  }
  
  // 如果是 null 或 undefined
  if (value == null) {
    return 0;
  }
  
  // 最后尝试直接转换
  const parsed = Number(value);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * 创建一个兼容的 Price 对象
 * 确保 close 和 div 字段可以被正确处理
 */
export function createCompatiblePrice(date: Date, close: number, div?: number | null): any {
  return {
    date,
    close: close, // 直接存储为数字，避免 Decimal 序列化问题
    div: div || null
  };
}

/**
 * 规范化价格数据数组
 * 确保所有数值字段都可以被安全访问
 */
export function normalizePriceData(priceData: any[]): any[] {
  return priceData.map(price => ({
    date: price.date,
    close: toNumber(price.close),
    div: price.div ? toNumber(price.div) : null
  }));
}

/**
 * 检查值是否为有效数字
 */
export function isValidNumber(value: any): boolean {
  const num = toNumber(value);
  return !isNaN(num) && isFinite(num);
}

/**
 * 格式化数字为货币字符串
 */
export function formatCurrency(value: any, decimals: number = 2): string {
  const num = toNumber(value);
  return num.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

/**
 * 格式化数字为百分比字符串
 */
export function formatPercentage(value: any, decimals: number = 2): string {
  const num = toNumber(value) * 100;
  return `${num.toFixed(decimals)}%`;
}
