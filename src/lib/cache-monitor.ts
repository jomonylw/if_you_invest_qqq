// src/lib/cache-monitor.ts

interface CacheStats {
  hits: number;
  misses: number;
  total: number;
  operations: {
    [key: string]: {
      hits: number;
      misses: number;
      lastAccess: Date;
      avgDuration: number;
    };
  };
}

/**
 * 缓存监控器 - 仅在开发环境启用
 */
export class CacheMonitor {
  private static stats: CacheStats = {
    hits: 0,
    misses: 0,
    total: 0,
    operations: {}
  };

  private static isDev = process.env.NODE_ENV === 'development';

  /**
   * 记录缓存命中
   */
  static recordHit(key: string, duration: number = 0): void {
    if (!this.isDev) return;

    this.stats.hits++;
    this.stats.total++;
    
    if (!this.stats.operations[key]) {
      this.stats.operations[key] = {
        hits: 0,
        misses: 0,
        lastAccess: new Date(),
        avgDuration: 0
      };
    }

    const op = this.stats.operations[key];
    op.hits++;
    op.lastAccess = new Date();
    op.avgDuration = (op.avgDuration * (op.hits - 1) + duration) / op.hits;

    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const hitRate = this.getHitRate(key);
    console.log(`🎯 [${timestamp}] Cache HIT: ${key} (${duration}ms) | Hit Rate: ${hitRate}%`);
  }

  /**
   * 记录缓存未命中
   */
  static recordMiss(key: string, duration: number = 0): void {
    if (!this.isDev) return;

    this.stats.misses++;
    this.stats.total++;

    if (!this.stats.operations[key]) {
      this.stats.operations[key] = {
        hits: 0,
        misses: 0,
        lastAccess: new Date(),
        avgDuration: 0
      };
    }

    const op = this.stats.operations[key];
    op.misses++;
    op.lastAccess = new Date();

    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const hitRate = this.getHitRate(key);
    console.log(`❌ [${timestamp}] Cache MISS: ${key} (${duration}ms) | Hit Rate: ${hitRate}%`);
  }

  /**
   * 记录缓存设置
   */
  static recordSet(key: string, dataSize?: number): void {
    if (!this.isDev) return;

    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const sizeInfo = dataSize ? ` | Size: ${this.formatBytes(dataSize)}` : '';
    console.log(`💾 [${timestamp}] Cache SET: ${key}${sizeInfo}`);
  }

  /**
   * 记录缓存失效
   */
  static recordInvalidation(key: string): void {
    if (!this.isDev) return;

    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    console.log(`🗑️  [${timestamp}] Cache INVALIDATED: ${key}`);
  }

  /**
   * 获取特定键的命中率
   */
  private static getHitRate(key: string): string {
    const op = this.stats.operations[key];
    if (!op || (op.hits + op.misses) === 0) return '0.0';
    return ((op.hits / (op.hits + op.misses)) * 100).toFixed(1);
  }

  /**
   * 获取总体统计信息
   */
  static getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * 打印详细统计信息
   */
  static printStats(): void {
    if (!this.isDev) return;

    const overallHitRate = this.stats.total > 0 
      ? ((this.stats.hits / this.stats.total) * 100).toFixed(1) 
      : '0.0';

    console.log('\n📊 ===== CACHE STATISTICS =====');
    console.log(`📈 Overall: ${this.stats.hits}/${this.stats.total} hits (${overallHitRate}%)`);
    console.log(`📉 Misses: ${this.stats.misses}`);
    console.log('\n📋 Per-Key Statistics:');
    
    Object.entries(this.stats.operations).forEach(([key, op]) => {
      const hitRate = ((op.hits / (op.hits + op.misses)) * 100).toFixed(1);
      const avgDuration = op.avgDuration.toFixed(1);
      const lastAccess = op.lastAccess.toLocaleTimeString();
      
      console.log(`  🔑 ${key}:`);
      console.log(`     Hit Rate: ${hitRate}% (${op.hits}/${op.hits + op.misses})`);
      console.log(`     Avg Duration: ${avgDuration}ms`);
      console.log(`     Last Access: ${lastAccess}`);
    });
    console.log('==============================\n');
  }

  /**
   * 重置统计信息
   */
  static reset(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      total: 0,
      operations: {}
    };
    if (this.isDev) {
      console.log('🔄 Cache statistics reset');
    }
  }

  /**
   * 格式化字节大小
   */
  private static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * 启动定期统计报告（仅开发环境）
   */
  static startPeriodicReporting(intervalMs: number = 60000): void {
    if (!this.isDev) return;

    setInterval(() => {
      if (this.stats.total > 0) {
        this.printStats();
      }
    }, intervalMs);

    console.log(`📊 Cache monitoring started (reporting every ${intervalMs/1000}s)`);
  }
}

/**
 * 缓存装饰器 - 自动监控缓存操作
 */
export function withCacheMonitoring(cacheKey: string) {
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
      const startTime = Date.now();
      
      try {
        const result = await method.apply(this, args);
        const duration = Date.now() - startTime;
        
        // 假设如果执行时间很短，可能是缓存命中
        if (duration < 100) {
          CacheMonitor.recordHit(cacheKey, duration);
        } else {
          CacheMonitor.recordMiss(cacheKey, duration);
        }
        
        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        CacheMonitor.recordMiss(cacheKey, duration);
        throw error;
      }
    } as T;
    return descriptor;
  };
}
