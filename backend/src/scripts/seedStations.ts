import { prisma } from "../lib/prisma";
import { fetchBoholStations } from "../services/overpass";

const run = async () => {
  const stations = await fetchBoholStations();

  for (const station of stations) {
    await prisma.station.upsert({
      where: { osmId: station.osmId },
      update: {
        name: station.name,
        brand: station.brand,
        latitude: station.latitude,
        longitude: station.longitude,
        region: station.region,
        address: station.address,
      },
      create: {
        osmId: station.osmId,
        name: station.name,
        brand: station.brand,
        latitude: station.latitude,
        longitude: station.longitude,
        region: station.region,
        address: station.address,
      },
    });
  }

  console.log(`Seeded/updated ${stations.length} stations in Bohol.`);
};

run()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
