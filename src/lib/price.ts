// src/lib/price.ts
import { PrismaClient, Price } from '@prisma/client';

const prisma = new PrismaClient();

// Cache variables
let cachedPriceData: Price[] | null = null;
let cacheExpiryTime: number | null = null;
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function getPriceData(startDate?: string, endDate?: string) {
  const defaultStartDate = new Date('1990-01-01T00:00:00.000Z');
  const defaultEndDate = new Date(); // Today

  const queryStartDate = startDate ? new Date(startDate) : defaultStartDate;
  const queryEndDate = endDate ? new Date(endDate) : defaultEndDate;

  // Check if cache is valid
  if (!cachedPriceData || !cacheExpiryTime || Date.now() >= cacheExpiryTime) {
    console.log('Cache miss or expired. Fetching all price data from database...');
    try {
      const allPriceData = await prisma.price.findMany({
        orderBy: {
          date: 'asc', // Ensure data is sorted for consistent filtering
        },
      });
      cachedPriceData = allPriceData;
      cacheExpiryTime = Date.now() + CACHE_DURATION_MS;
      console.log(`All price data fetched and cached. ${cachedPriceData.length} records. Cache expires at ${new Date(cacheExpiryTime).toISOString()}`);
    } catch (error) {
      console.error('Error fetching all price data for cache:', error);
      // If fetching all data fails, we might not want to proceed or could return an error/empty
      // For now, rethrow the error. Consider if stale data (if available) could be returned.
      throw error;
    } finally {
      // It's generally better to instantiate PrismaClient once and keep it alive
      // rather than connecting/disconnecting on each operation, especially in server environments.
      // However, to keep changes minimal to the original structure for now:
      await prisma.$disconnect();
    }
  } else {
    console.log('Cache hit. Using cached price data.');
  }

  // Filter from the (now populated) cache
  if (cachedPriceData) {
    const filteredData = cachedPriceData.filter(price => {
      const priceDate = new Date(price.date);
      // Ensure the date comparison is correct. Dates from DB are UTC.
      // queryStartDate and queryEndDate are local if not specified with Z.
      // For simplicity, assuming dates are handled consistently.
      return priceDate >= queryStartDate && priceDate <= queryEndDate;
    });
    console.log(`Returning ${filteredData.length} records for the period ${queryStartDate.toISOString().split('T')[0]} to ${queryEndDate.toISOString().split('T')[0]}`);
    return filteredData;
  }

  // Should not be reached if caching logic is correct and DB fetch was successful
  return [];
}