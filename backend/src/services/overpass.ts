import { detectRegion, isInBohol } from "./boholRegion";

export type OverpassStation = {
  osmId: string;
  name: string;
  brand: string | null;
  latitude: number;
  longitude: number;
  address: string | null;
  region: "DAUIS" | "PANGLAO" | "BOHOL_PROPER";
};

const OVERPASS_URLS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

const buildAddress = (tags: Record<string, string>): string | null => {
  const parts = [tags["addr:housenumber"], tags["addr:street"], tags["addr:city"]].filter(Boolean);
  return parts.length ? parts.join(" ") : null;
};

export const fetchBoholStations = async (): Promise<OverpassStation[]> => {
  const query = `
[out:json][timeout:120];
(
  node["amenity"="fuel"](9.45,123.60,10.25,124.35);
  way["amenity"="fuel"](9.45,123.60,10.25,124.35);
  relation["amenity"="fuel"](9.45,123.60,10.25,124.35);
);
out center tags;
`;

  let response: Response | null = null;
  let lastError = "Overpass request failed";

  for (const endpoint of OVERPASS_URLS) {
    const url = `${endpoint}?data=${encodeURIComponent(query)}`;
    const next = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "User-Agent": "tubil-local-dev/1.0",
      },
    });

    if (next.ok) {
      response = next;
      break;
    }

    lastError = `Overpass API failed (${endpoint}): ${next.status}`;
  }

  if (!response) {
    throw new Error(lastError);
  }

  const data = (await response.json()) as {
    elements: Array<{
      id: number;
      lat?: number;
      lon?: number;
      center?: { lat: number; lon: number };
      tags?: Record<string, string>;
    }>;
  };

  const stations: OverpassStation[] = [];

  for (const element of data.elements) {
    const lat = element.lat ?? element.center?.lat;
    const lon = element.lon ?? element.center?.lon;

    if (lat == null || lon == null || !isInBohol(lat, lon)) {
      continue;
    }

    const tags = element.tags ?? {};
    const name = tags.name?.trim() || "Unnamed Fuel Station";

    stations.push({
      osmId: String(element.id),
      name,
      brand: tags.brand ?? null,
      latitude: lat,
      longitude: lon,
      address: buildAddress(tags),
      region: detectRegion(lat, lon),
    });
  }

  return stations;
};
