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
    let attempts = 0;
    const maxRetries = 3;
    const retryDelayMs = 1000; // 1 second delay between retries

    while (attempts < maxRetries) {
      try {
        const allPriceData = await prisma.price.findMany({
          orderBy: {
            date: 'asc', // Ensure data is sorted for consistent filtering
          },
        });
        cachedPriceData = allPriceData;
        cacheExpiryTime = Date.now() + CACHE_DURATION_MS;
        console.log(`All price data fetched and cached. ${cachedPriceData.length} records. Cache expires at ${new Date(cacheExpiryTime).toISOString()}`);
        break; // Exit loop on success
      } catch (error) {
        attempts++;
        console.error(`Error fetching all price data (attempt ${attempts}/${maxRetries}):`, error);
        if (attempts >= maxRetries) {
          console.error('Max retries reached. Failed to fetch price data.');
          // If fetching all data fails, we might not want to proceed or could return an error/empty
          // For now, rethrow the error. Consider if stale data (if available) could be returned.
          throw error;
        }
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, retryDelayMs));
      }
    }
    // Disconnect Prisma client after fetching data or exhausting retries
    // It's generally better to instantiate PrismaClient once and keep it alive
    // rather than connecting/disconnecting on each operation, especially in server environments.
    // However, to keep changes minimal to the original structure for now:
    // We move $disconnect outside the try-catch-finally of the loop to ensure it's called once.
    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      console.error('Error disconnecting Prisma client:', disconnectError);
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