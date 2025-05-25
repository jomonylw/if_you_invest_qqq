// src/lib/price.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getPriceData(startDate?: string, endDate?: string) {
  const defaultStartDate = new Date('1990-01-01T00:00:00.000Z');
  const defaultEndDate = new Date();

  const start = startDate ? new Date(startDate) : defaultStartDate;
  const end = endDate ? new Date(endDate) : defaultEndDate;

  try {
    const priceData = await prisma.price.findMany({
      where: {
        date: {
          gte: start,
          lte: end,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });
    console.log(`Fetching price data from ${start.toISOString().split('T')[0]} to ${end.toISOString().split('T')[0]}`);
    return priceData;
  } catch (error) {
    console.error('Error fetching price data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}