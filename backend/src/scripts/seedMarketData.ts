import { FuelType, Region } from "@prisma/client";
import { prisma } from "../lib/prisma";

const BASE_PRICE: Record<FuelType, number> = {
	GASOLINE: 99.4,
	DIESEL: 95.2,
	PREMIUM: 104.8,
};

const REGION_BUMP: Record<Region, number> = {
	DAUIS: 0.2,
	PANGLAO: 0.6,
	BOHOL_PROPER: 0,
};

const BRAND_BUMP: Array<{ test: RegExp; bump: number }> = [
	{ test: /shell/i, bump: 1.4 },
	{ test: /caltex|chevron/i, bump: 1.5 },
	{ test: /petron/i, bump: 0.9 },
	{ test: /phoenix/i, bump: 0.5 },
	{ test: /seaoil/i, bump: 0.3 },
	{ test: /uno|unioil/i, bump: -0.6 },
	{ test: /jetti/i, bump: -0.4 },
];

const round2 = (value: number) => Math.round(value * 100) / 100;

const simpleHash = (value: string) => {
	let hash = 0;
	for (let i = 0; i < value.length; i += 1) {
		hash = (hash * 31 + value.charCodeAt(i)) | 0;
	}
	return Math.abs(hash);
};

const jitter = (stationId: string, fuelType: FuelType) => {
	const n = simpleHash(`${stationId}:${fuelType}`) % 1000;
	return (n / 1000) * 1.8 - 0.9;
};

const getBrandBump = (brand: string | null, name: string) => {
	const text = `${brand ?? ""} ${name}`;
	const found = BRAND_BUMP.find((entry) => entry.test.test(text));
	return found?.bump ?? -0.1;
};

const run = async () => {
	const stations = await prisma.station.findMany({
		select: {
			id: true,
			name: true,
			brand: true,
			region: true,
		},
	});

	let created = 0;

	for (const station of stations) {
		const brandBump = getBrandBump(station.brand, station.name);
		const regionBump = REGION_BUMP[station.region];

		for (const fuelType of Object.values(FuelType)) {
			const estimate = round2(BASE_PRICE[fuelType] + brandBump + regionBump + jitter(station.id, fuelType));

			await prisma.fuelPrice.create({
				data: {
					stationId: station.id,
					userId: null,
					fuelType,
					pricePerLiter: estimate,
					isVerified: false,
					verificationScore: 0,
				},
			});

			created += 1;
		}
	}

	console.log(`Seeded ${created} near-market price records for ${stations.length} stations.`);
	console.log("Prices are seeded estimates and should be verified in the app.");
};

run()
	.catch((error) => {
		console.error(error);
		process.exitCode = 1;
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
