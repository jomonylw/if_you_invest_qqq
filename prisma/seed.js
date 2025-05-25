import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function main() {
  const priceDataPath = path.resolve(__dirname, 'price-data.json');
  const priceSeedData = JSON.parse(fs.readFileSync(priceDataPath, 'utf-8'));

  const divDataPath = path.resolve(__dirname, 'div-data.json');
  const divSeedData = JSON.parse(fs.readFileSync(divDataPath, 'utf-8'));

  // Create a sorted list of price dates for efficient lookup and a set for quick existence check
  const priceDates = priceSeedData.flatMap(data => data.series.map(item => new Date(item.date).toISOString().split('T')[0])).sort();
  const priceDateSet = new Set(priceDates);

  // Create a map for final dividend data, matching div-data dates to price-data dates
  const finalDivMap = new Map();
  for (const data of divSeedData) {
    for (const dividendItem of data.events.dividend) {
      // Normalize date to YYYY-MM-DD for consistent key
      const divDateKey = new Date(dividendItem.date).toISOString().split('T')[0];
      let targetDateKey = divDateKey;

      if (!priceDateSet.has(divDateKey)) {
        // If divDateKey is not in priceDateSet, find the next available date in priceDates
        let foundNextDate = false;
        for (const priceDate of priceDates) {
          if (priceDate >= divDateKey) { // Find the first price date >= divDateKey
            targetDateKey = priceDate;
            foundNextDate = true;
            break;
          }
        }
        if (!foundNextDate) continue; // If no suitable price date found, skip this dividend item
      }
      finalDivMap.set(targetDateKey, dividendItem.value);
    }
  }

  const recordsToUpsert = [];
  for (const data of priceSeedData) {
    for (const seriesItem of data.series) {
      const date = new Date(seriesItem.date);
      const dateKey = date.toISOString().split('T')[0];
      const divValue = finalDivMap.get(dateKey) || null; // Get div value or null if not found

      recordsToUpsert.push({
        date: date,
        close: seriesItem.close,
        div: divValue,
      });
    }
  }

  // Perform bulk create for all records
  await prisma.price.createMany({
    data: recordsToUpsert,
    skipDuplicates: true, // In case there are duplicates in the JSON data itself
  });

  console.log('Price and Dividend seed data inserted successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });