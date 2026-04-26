export type RegionKey = "DAUIS" | "PANGLAO" | "BOHOL_PROPER";

type BoundingBox = {
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
};

const BOHOL_BBOX: BoundingBox = {
  minLat: 9.45,
  maxLat: 10.25,
  minLon: 123.6,
  maxLon: 124.35,
};

const DAUIS_BBOX: BoundingBox = {
  minLat: 9.58,
  maxLat: 9.69,
  minLon: 123.82,
  maxLon: 123.93,
};

const PANGLAO_BBOX: BoundingBox = {
  minLat: 9.52,
  maxLat: 9.66,
  minLon: 123.72,
  maxLon: 123.86,
};

const inBox = (lat: number, lon: number, box: BoundingBox) => {
  return lat >= box.minLat && lat <= box.maxLat && lon >= box.minLon && lon <= box.maxLon;
};

export const isInBohol = (lat: number, lon: number) => inBox(lat, lon, BOHOL_BBOX);

export const detectRegion = (lat: number, lon: number): RegionKey => {
  if (inBox(lat, lon, DAUIS_BBOX)) {
    return "DAUIS";
  }
  if (inBox(lat, lon, PANGLAO_BBOX)) {
    return "PANGLAO";
  }
  return "BOHOL_PROPER";
};

export const haversineKm = (
  aLat: number,
  aLon: number,
  bLat: number,
  bLon: number,
): number => {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLon = toRad(bLon - aLon);
  const lat1 = toRad(aLat);
  const lat2 = toRad(bLat);

  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  return 2 * 6371 * Math.asin(Math.sqrt(h));
};
