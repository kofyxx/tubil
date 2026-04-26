import axios from "axios";
import L from "leaflet";
import type { FuelType, Region, Station } from "../types";

export const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    const message = (error.response?.data as { message?: string } | undefined)?.message;
    if (message) {
      return message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};

export const normalizeStationText = (value: string, maxLength: number) => value.trim().slice(0, maxLength);

export const toNumber = (value: string | number) => Number(value);

export const getPreferredFuelPrice = (station: Station, fuelType: FuelType) => {
  const reports = station.fuelPrices.filter((price) => price.fuelType === fuelType);
  if (reports.length === 0) {
    return null;
  }

  return [...reports].sort((a, b) => {
    if (a.verificationScore !== b.verificationScore) {
      return b.verificationScore - a.verificationScore;
    }

    if (a.isVerified !== b.isVerified) {
      return a.isVerified ? -1 : 1;
    }

    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  })[0];
};

export const haversineKm = (aLat: number, aLon: number, bLat: number, bLon: number) => {
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

export const detectRegionFromCoords = (lat: number, lon: number): Region => {
  if (lat >= 9.58 && lat <= 9.69 && lon >= 123.82 && lon <= 123.93) {
    return "DAUIS";
  }

  if (lat >= 9.52 && lat <= 9.66 && lon >= 123.72 && lon <= 123.86) {
    return "PANGLAO";
  }

  return "BOHOL_PROPER";
};

export const reverseGeocode = async (lat: number, lon: number) => {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=17&addressdetails=1`,
    {
      headers: {
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error("Reverse geocoding failed.");
  }

  const data = (await response.json()) as {
    display_name?: string;
    name?: string;
  };

  return data.name || data.display_name || `Pinned destination (${lat.toFixed(5)}, ${lon.toFixed(5)})`;
};

export const reverseGeocodeStationLocation = async (lat: number, lon: number) => {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
    {
      headers: {
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error("Reverse geocoding failed.");
  }

  const data = (await response.json()) as {
    display_name?: string;
    name?: string;
    address?: {
      house_number?: string;
      road?: string;
      neighbourhood?: string;
      suburb?: string;
      village?: string;
      town?: string;
      city?: string;
      municipality?: string;
      county?: string;
      state?: string;
      region?: string;
      country?: string;
    };
  };

  const parts = [
    data.address?.house_number && data.address.road ? `${data.address.house_number} ${data.address.road}` : data.address?.road,
    data.address?.neighbourhood,
    data.address?.suburb,
    data.address?.village,
    data.address?.town,
    data.address?.city,
    data.address?.municipality,
    data.address?.county,
    data.address?.state,
    data.address?.country,
  ].filter((part): part is string => Boolean(part));

  return {
    address: parts.join(", ") || data.name || data.display_name || `Pinned location (${lat.toFixed(5)}, ${lon.toFixed(5)})`,
    region: detectRegionFromCoords(lat, lon),
  };
};

export const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      if (!result) {
        reject(new Error("Unable to parse file."));
        return;
      }
      resolve(result);
    };
    reader.onerror = () => reject(new Error("Unable to read file."));
    reader.readAsDataURL(file);
  });

export const resizeAndCompressImage = async (file: File, maxDimension: number) => {
  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Unable to load image."));
      img.src = objectUrl;
    });

    const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Unable to initialize canvas.");
    }

    context.drawImage(image, 0, 0, width, height);

    let quality = 0.9;
    let output = canvas.toDataURL("image/jpeg", quality);

    while (output.length > 900_000 && quality > 0.5) {
      quality -= 0.1;
      output = canvas.toDataURL("image/jpeg", quality);
    }

    return output;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
};

export const createPinIcon = (label: string, color: string) =>
  L.divIcon({
    className: "tubil-pin-icon",
    html: `
      <div class="tubil-pin" style="--pin-color:${color}">
        <div class="tubil-pin__head">${label}</div>
        <div class="tubil-pin__point"></div>
      </div>
    `,
    iconSize: [40, 56],
    iconAnchor: [20, 52],
    popupAnchor: [0, -48],
  });
