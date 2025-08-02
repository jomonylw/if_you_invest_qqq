// src/lib/performance.ts

/**
 * 性能监控工具
 */
export class PerformanceMonitor {
  private static timers: Map<string, number> = new Map();

  /**
   * 开始计时
   */
  static start(label: string): void {
    this.timers.set(label, Date.now());
    console.log(`⏱️  [${label}] Started`);
  }

  /**
   * 结束计时并记录
   */
  static end(label: string): number {
    const startTime = this.timers.get(label);
    if (!startTime) {
      console.warn(`⚠️  [${label}] Timer not found`);
      return 0;
    }

    const duration = Date.now() - startTime;
    this.timers.delete(label);
    
    console.log(`✅ [${label}] Completed in ${duration}ms`);
    return duration;
  }

  /**
   * 测量异步函数执行时间
   */
  static async measure<T>(label: string, fn: () => Promise<T>): Promise<T> {
    this.start(label);
    try {
      const result = await fn();
      this.end(label);
      return result;
    } catch (error) {
      this.end(label);
      throw error;
    }
  }

  /**
   * 记录缓存命中/未命中
   */
  static logCacheHit(key: string, hit: boolean, duration?: number): void {
    const status = hit ? '🎯 HIT' : '❌ MISS';
    const timeInfo = duration ? ` (${duration}ms)` : '';
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    console.log(`💾 [${timestamp}] Cache ${status}: ${key}${timeInfo}`);
  }

  /**
   * 记录缓存操作详情
   */
  static logCacheOperation(operation: 'GET' | 'SET' | 'INVALIDATE', key: string, details?: Record<string, unknown>): void {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const emoji = operation === 'GET' ? '📖' : operation === 'SET' ? '💾' : '🗑️';
    const detailsStr = details ? ` | ${JSON.stringify(details)}` : '';
    console.log(`${emoji} [${timestamp}] Cache ${operation}: ${key}${detailsStr}`);
  }

  /**
   * 记录缓存统计信息
   */
  static logCacheStats(stats: { hits: number; misses: number; total: number }): void {
    const hitRate = stats.total > 0 ? ((stats.hits / stats.total) * 100).toFixed(1) : '0';
    console.log(`📊 Cache Stats: ${stats.hits}/${stats.total} hits (${hitRate}%) | ${stats.misses} misses`);
  }

  /**
   * 记录API响应大小
   */
  static logResponseSize(endpoint: string, size: number): void {
    const sizeKB = (size / 1024).toFixed(2);
    console.log(`📊 [${endpoint}] Response size: ${sizeKB}KB`);
  }
}

/**
 * 性能装饰器
 */
export function withPerformanceMonitoring(label: string) {
  return function <T extends (...args: unknown[]) => Promise<unknown>>(
    target: object,
    propertyName: string,
    descriptor: TypedPropertyDescriptor<T>
  ) {
    const method = descriptor.value;
    if (!method) {
      return descriptor;
    }

    descriptor.value = async function (this: unknown, ...args: unknown[]) {
      return PerformanceMonitor.measure(
        `${label}.${propertyName}`,
        () => method.apply(this, args)
      );
    } as T;
    return descriptor;
  };
}

/**
 * 内存使用监控
 */
export class MemoryMonitor {
  /**
   * 记录当前内存使用情况
   */
  static log(label: string): void {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const usage = process.memoryUsage();
      const formatBytes = (bytes: number) => (bytes / 1024 / 1024).toFixed(2);
      
      console.log(`🧠 [${label}] Memory Usage:`, {
        rss: `${formatBytes(usage.rss)}MB`,
        heapUsed: `${formatBytes(usage.heapUsed)}MB`,
        heapTotal: `${formatBytes(usage.heapTotal)}MB`,
        external: `${formatBytes(usage.external)}MB`,
      });
    }
  }
}
