import { Suspense, useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import axios from "axios";
import L from "leaflet";
import {
  Alert,
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  CssBaseline,
  Dialog,
  DialogContent,
  Grid,
  Stack,
  Switch,
  Toolbar,
  Typography,
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import "leaflet/dist/leaflet.css";
import { dashboardSections, defaultUnitPresets, fuelTypes, garagePresetsStorageKey, imageFallback } from "./app/data";
import { renderBulbSwitchGlyph } from "./app/headerGlyph";
import type { DashboardMode, DashboardSection, RouteEstimate, UnitPreset } from "./app/models";
import { getSectionsForDashboard, sectionDescriptions } from "./app/sections";
import { createAppTheme, renderAmbientBackground } from "./app/theme";
import { getAppBarSx, getModuleCardSx } from "./app/uiStyles";
import { fetchUnitImageByName, inferCategoryFromName } from "./app/unitImages";
import { DashboardSectionContent } from "./app/views/DashboardSectionContent";
import { LandingView } from "./app/views/LandingView";
import { SectionLoadingFallback } from "./app/views/SectionLoadingFallback";
import {
  createPinIcon,
  detectRegionFromCoords,
  getApiErrorMessage,
  getPreferredFuelPrice,
  haversineKm,
  normalizeStationText,
  readFileAsDataUrl,
  resizeAndCompressImage,
  reverseGeocode,
  reverseGeocodeStationLocation,
  toNumber,
} from "./app/utils";
import { API_BASE_URL } from "./config";
import type { AuthUser, FuelType, LeaderboardEntry, Refuel, Region, Station, Trip, Vehicle } from "./types";

const client = axios.create({
  baseURL: API_BASE_URL,
});

function App() {
  const storedActiveSection = localStorage.getItem("tubil_active_section") as DashboardSection | null;
  const storedDarkMode = localStorage.getItem("tubil_dark_mode") === "1";

  const [token, setToken] = useState<string>(localStorage.getItem("tubil_token") ?? "");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [error, setError] = useState("");
  const [okMessage, setOkMessage] = useState("");
  const [darkMode, setDarkMode] = useState(storedDarkMode);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [displayName, setDisplayName] = useState("");
  const [profilePhotoDataUrl, setProfilePhotoDataUrl] = useState("");
  const [profileImagePreviewOpen, setProfileImagePreviewOpen] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationAccuracyM, setLocationAccuracyM] = useState<number | null>(null);
  const [currentLocationName, setCurrentLocationName] = useState("Resolving location...");

  const [location, setLocation] = useState({ lat: 9.65, lon: 123.86 });
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedStationId, setSelectedStationId] = useState("");
  const [priceFuelType, setPriceFuelType] = useState<FuelType>("GASOLINE");
  const [priceValue, setPriceValue] = useState("");
  const [mapRoute, setMapRoute] = useState<RouteEstimate | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [stationForm, setStationForm] = useState({
    name: "",
    brand: "",
    latitude: "",
    longitude: "",
    region: "BOHOL_PROPER" as Region,
    address: "",
    initialGasolinePrice: "",
  });
  const [stationFormDirty, setStationFormDirty] = useState(false);
  const [stationMapPickerEnabled, setStationMapPickerEnabled] = useState(false);
  const lastStationFormSyncIdRef = useRef("");

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleForm, setVehicleForm] = useState({
    name: "",
    fuelType: "GASOLINE" as FuelType,
    efficiencyKmPerL: "",
  });
  const [garagePresets, setGaragePresets] = useState<UnitPreset[]>(() => {
    try {
      const saved = localStorage.getItem(garagePresetsStorageKey);
      if (!saved) {
        return defaultUnitPresets;
      }

      const parsed = JSON.parse(saved) as UnitPreset[];
      if (!Array.isArray(parsed) || parsed.length === 0) {
        return defaultUnitPresets;
      }

      return parsed;
    } catch {
      return defaultUnitPresets;
    }
  });
  const [presetForm, setPresetForm] = useState<UnitPreset>({
    name: "",
    fuelType: "GASOLINE",
    efficiencyKmPerL: 10,
    category: "Vehicle",
  });
  const [editingPresetName, setEditingPresetName] = useState<string | null>(null);
  const [unitImageMap, setUnitImageMap] = useState<Record<string, string>>({});

  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);
  const [editingVehicleForm, setEditingVehicleForm] = useState({
    name: "",
    fuelType: "GASOLINE" as FuelType,
    efficiencyKmPerL: "",
  });
  const [editingRefuelId, setEditingRefuelId] = useState<string | null>(null);
  const [editingRefuelForm, setEditingRefuelForm] = useState({
    vehicleId: "",
    stationId: "",
    liters: "",
    totalCost: "",
  });

  const [tripForm, setTripForm] = useState({
    vehicleId: "",
    origin: "Current Location",
    destination: "",
    distanceKm: "15",
    fuelPricePerLiter: "99",
  });
  const [tripDestination, setTripDestination] = useState<{ lat: number; lon: number } | null>(null);
  const [reverseGeocodingBusy, setReverseGeocodingBusy] = useState(false);
  const [routeEstimate, setRouteEstimate] = useState<RouteEstimate | null>(null);
  const [routingBusy, setRoutingBusy] = useState(false);
  const [trips, setTrips] = useState<Trip[]>([]);

  const [refuelForm, setRefuelForm] = useState({
    vehicleId: "",
    stationId: "",
    liters: "",
    totalCost: "",
  });
  const [refuels, setRefuels] = useState<Refuel[]>([]);

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [votingPriceId, setVotingPriceId] = useState("");
  const [importingStations, setImportingStations] = useState(false);
  const [activeSection, setActiveSection] = useState<DashboardSection>(
    storedActiveSection && dashboardSections.includes(storedActiveSection) ? storedActiveSection : "map",
  );
  const [dashboardMode, setDashboardMode] = useState<DashboardMode>("user");
  const [authResolved, setAuthResolved] = useState(!token);
  const unitImageCacheRef = useRef<Record<string, string>>({});

  const mapHostRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerLayerRef = useRef<L.LayerGroup | null>(null);
  const estimatorMapHostRef = useRef<HTMLDivElement | null>(null);
  const estimatorMapRef = useRef<L.Map | null>(null);
  const estimatorLayerRef = useRef<L.LayerGroup | null>(null);
  const reverseGeocodeRequestRef = useRef(0);
  const stationReverseGeocodeRequestRef = useRef(0);
  const profilePhotoInputRef = useRef<HTMLInputElement | null>(null);

  const authHeaders = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);
  const profilePhotoStorageKey = useMemo(() => (user ? `tubil_profile_photo_${user.id}` : ""), [user]);
  const appTheme = useMemo(() => createAppTheme(darkMode), [darkMode]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      const scrollX = window.scrollX || window.pageXOffset;
      const rayOne = document.getElementById("ray-one");
      const rayTwo = document.getElementById("ray-two");
      const rayThree = document.getElementById("ray-three");
      const orbOne = document.getElementById("orb-one");
      const orbTwo = document.getElementById("orb-two");

      if (rayOne) rayOne.style.transform = `translate3d(${scrollX * 0.03}px, ${scrollY * 0.05}px, 0) rotate(-11deg)`;
      if (rayTwo) rayTwo.style.transform = `translate3d(${-scrollX * 0.02}px, ${-scrollY * 0.08}px, 0) rotate(16deg)`;
      if (rayThree) rayThree.style.transform = `translate3d(${scrollX * 0.01}px, ${scrollY * 0.03}px, 0) rotate(31deg)`;
      if (orbOne) orbOne.style.transform = `translate3d(${scrollX * 0.02}px, ${scrollY * 0.04}px, 0)`;
      if (orbTwo) orbTwo.style.transform = `translate3d(${-scrollX * 0.03}px, ${-scrollY * 0.05}px, 0)`;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    localStorage.setItem("tubil_dark_mode", darkMode ? "1" : "0");
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem(garagePresetsStorageKey, JSON.stringify(garagePresets));
  }, [garagePresets]);

  useEffect(() => {
    if (!okMessage) return;
    const timer = setTimeout(() => setOkMessage(""), 2000);
    return () => clearTimeout(timer);
  }, [okMessage]);

  useEffect(() => {
    const allNames = Array.from(new Set([...garagePresets.map((preset) => preset.name), ...vehicles.map((vehicle) => vehicle.name)]));
    const categoryByName = new Map<string, "Vehicle" | "Motorcycle">();
    garagePresets.forEach((preset) => {
      categoryByName.set(preset.name, preset.category);
    });
    vehicles.forEach((vehicle) => {
      if (!categoryByName.has(vehicle.name)) {
        categoryByName.set(vehicle.name, inferCategoryFromName(vehicle.name));
      }
    });

    const unresolvedNames = allNames.filter((name) => !unitImageCacheRef.current[name]);

    if (unresolvedNames.length === 0) {
      return;
    }

    let cancelled = false;

    const loadImages = async () => {
      const nextEntries = (await Promise.all(
        unresolvedNames.map(async (name): Promise<[string, string] | null> => {
          const thumbnail = await fetchUnitImageByName(name, categoryByName.get(name));
          if (!thumbnail) {
            return null;
          }
          return [name, thumbnail];
        }),
      )).filter((entry): entry is [string, string] => Boolean(entry));

      if (cancelled || nextEntries.length === 0) {
        return;
      }

      nextEntries.forEach(([name, url]) => {
        unitImageCacheRef.current[name] = url;
      });

      setUnitImageMap((prev) => {
        const merged = { ...prev };
        nextEntries.forEach(([name, url]) => {
          merged[name] = url;
        });
        return merged;
      });
    };

    void loadImages();

    return () => {
      cancelled = true;
    };
  }, [vehicles, garagePresets]);

  useEffect(() => {
    if (!profilePhotoStorageKey) {
      setProfilePhotoDataUrl("");
      return;
    }

    setProfilePhotoDataUrl(localStorage.getItem(profilePhotoStorageKey) ?? "");
  }, [profilePhotoStorageKey]);

  const onProfilePhotoChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file or GIF.");
      return;
    }

    const isGif = file.type === "image/gif" || file.name.toLowerCase().endsWith(".gif");

    if (isGif && file.size > 4 * 1024 * 1024) {
      setError("GIF is too large. Maximum GIF size is 4MB.");
      return;
    }

    if (!isGif && file.size > 20 * 1024 * 1024) {
      setError("Image is too large. Maximum original file size is 20MB.");
      return;
    }

    try {
      const result = isGif ? await readFileAsDataUrl(file) : await resizeAndCompressImage(file, 512);
      setProfilePhotoDataUrl(result);

      if (profilePhotoStorageKey) {
        try {
          localStorage.setItem(profilePhotoStorageKey, result);
        } catch {
          setError("Profile photo could not be saved. Try a smaller image or clear browser storage.");
        }
      }
    } catch {
      setError("Unable to read this file. Please try another image.");
    }
  };

  const removeProfilePhoto = () => {
    setProfilePhotoDataUrl("");
    if (profilePhotoStorageKey) {
      localStorage.removeItem(profilePhotoStorageKey);
    }
  };

  const openProfilePhotoPicker = () => {
    profilePhotoInputRef.current?.click();
  };

  const openProfilePhotoPreview = () => {
    setActiveSection("profile");
    setProfileImagePreviewOpen(true);
  };

  const selectedDestination = useMemo(() => {
    if (tripDestination) {
      return {
        lat: tripDestination.lat,
        lon: tripDestination.lon,
        name:
          tripForm.destination ||
          `Pinned destination (${tripDestination.lat.toFixed(5)}, ${tripDestination.lon.toFixed(5)})`,
      };
    }

    return null;
  }, [tripDestination, tripForm.destination]);

  const detectLocation = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({ lat: position.coords.latitude, lon: position.coords.longitude });
        setLocationAccuracyM(position.coords.accuracy ?? null);
        setLocating(false);
      },
      () => {
        setLocation({ lat: 9.65, lon: 123.86 });
        setLocationAccuracyM(null);
        setLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      },
    );
  };

  useEffect(() => {
    detectLocation();
  }, []);

  useEffect(() => {
    let cancelled = false;

    const resolveCurrentLocationName = async () => {
      try {
        const locationName = await reverseGeocode(location.lat, location.lon);
        if (!cancelled) {
          setCurrentLocationName(locationName);
        }
      } catch {
        if (!cancelled) {
          setCurrentLocationName("Location name unavailable");
        }
      }
    };

    void resolveCurrentLocationName();

    return () => {
      cancelled = true;
    };
  }, [location.lat, location.lon]);

  useEffect(() => {
    const selectedStation = stations.find((station) => station.id === selectedStationId);

    if (!selectedStation || !token) {
      setMapRoute(null);
      return;
    }

    let cancelled = false;

    const loadRoute = async () => {
      setRouteLoading(true);

      try {
        const response = await client.post<RouteEstimate>(
          "/trips/route",
          {
            originLat: location.lat,
            originLon: location.lon,
            destinationLat: selectedStation.latitude,
            destinationLon: selectedStation.longitude,
          },
          { headers: authHeaders },
        );

        if (!cancelled) {
          setMapRoute(response.data);
        }
      } catch {
        if (!cancelled) {
          setMapRoute({
            distanceKm: haversineKm(location.lat, location.lon, selectedStation.latitude, selectedStation.longitude),
            durationMin: 0,
            provider: "fallback",
            path: [
              { lat: location.lat, lon: location.lon },
              { lat: selectedStation.latitude, lon: selectedStation.longitude },
            ],
          });
        }
      } finally {
        if (!cancelled) {
          setRouteLoading(false);
        }
      }
    };

    void loadRoute();

    return () => {
      cancelled = true;
    };
  }, [selectedStationId, stations, location.lat, location.lon, token, authHeaders]);

  const loadStations = async () => {
    const response = await client.get<{ stations: Station[] }>("/stations", {
      params: { lat: location.lat, lon: location.lon, radiusKm: 20 },
    });
    const nextStations = response.data.stations;
    setStations(nextStations);

    if (!nextStations.length) {
      setSelectedStationId("");
      setRefuelForm((prev) => ({ ...prev, stationId: "" }));
      return;
    }

    const selectedStillExists = Boolean(selectedStationId) && nextStations.some((station) => station.id === selectedStationId);
    const nextSelectedStationId = selectedStillExists ? selectedStationId : nextStations[0].id;

    if (nextSelectedStationId !== selectedStationId) {
      setSelectedStationId(nextSelectedStationId);
    }

    setRefuelForm((prev) => (prev.stationId === nextSelectedStationId ? prev : { ...prev, stationId: nextSelectedStationId }));
  };

  const loadProtectedData = async () => {
    if (!token) {
      return;
    }

    const [vehicleRes, tripRes, refuelRes, meRes, boardRes] = await Promise.all([
      client.get<{ vehicles: Vehicle[] }>("/vehicles", { headers: authHeaders }),
      client.get<{ trips: Trip[] }>("/trips", { headers: authHeaders }),
      client.get<{ refuels: Refuel[] }>("/refuels", { headers: authHeaders }),
      client.get<{ user: AuthUser }>("/auth/me", { headers: authHeaders }),
      client.get<{ leaderboard: LeaderboardEntry[] }>("/leaderboard", { headers: authHeaders }),
    ]);

    setVehicles(vehicleRes.data.vehicles);
    setTrips(tripRes.data.trips);
    setRefuels(refuelRes.data.refuels);
    setUser(meRes.data.user);
    setDashboardMode(meRes.data.user.isAdmin ? "admin" : "user");
    setLeaderboard(boardRes.data.leaderboard);

    if (vehicleRes.data.vehicles.length) {
      const primary = vehicleRes.data.vehicles.find((unit) => unit.isPrimary) ?? vehicleRes.data.vehicles[0];
      setTripForm((prev) => ({ ...prev, vehicleId: primary.id }));
      setRefuelForm((prev) => ({ ...prev, vehicleId: primary.id }));
    }
  };

  useEffect(() => {
    loadStations().catch(() => setError("Failed to load station data."));
  }, [location.lat, location.lon, token]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      loadStations().catch(() => undefined);
    }, 30000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadStations().catch(() => undefined);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [location.lat, location.lon, token]);

  useEffect(() => {
    if (!token) {
      setAuthResolved(true);
      return;
    }

    setAuthResolved(false);
    loadProtectedData()
      .catch(() => setError("Failed to load dashboard data."))
      .finally(() => setAuthResolved(true));
  }, [token]);

  useEffect(() => {
    if (activeSection !== "map" || !mapHostRef.current || mapRef.current) {
      return;
    }

    const map = L.map(mapHostRef.current).setView([location.lat, location.lon], 12);
    L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}", {
      attribution:
        'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, IGN, Kadaster NL, Ordnance Survey, METI, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community',
    }).addTo(map);

    mapRef.current = map;
    markerLayerRef.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
      markerLayerRef.current = null;
    };
  }, [activeSection]);

  useEffect(() => {
    if (!mapRef.current) {
      return;
    }

    mapRef.current.setView([location.lat, location.lon], mapRef.current.getZoom());
  }, [location.lat, location.lon]);

  useEffect(() => {
    if (!mapRef.current || activeSection !== "map" || !user?.isAdmin || !stationMapPickerEnabled) {
      return;
    }

    const handleMapClick = async (event: L.LeafletMouseEvent) => {
      const lat = event.latlng.lat.toFixed(7);
      const lon = event.latlng.lng.toFixed(7);
      const requestId = stationReverseGeocodeRequestRef.current + 1;
      stationReverseGeocodeRequestRef.current = requestId;

      setStationFormDirty(true);
      setStationForm((prev) => ({
        ...prev,
        latitude: lat,
        longitude: lon,
      }));

      try {
        const locationInfo = await reverseGeocodeStationLocation(event.latlng.lat, event.latlng.lng);

        if (stationReverseGeocodeRequestRef.current !== requestId) {
          return;
        }

        setStationForm((prev) => ({
          ...prev,
          region: locationInfo.region,
          address: locationInfo.address,
        }));
        setOkMessage(`Picked station location: ${lat}, ${lon}`);
      } catch {
        if (stationReverseGeocodeRequestRef.current !== requestId) {
          return;
        }

        setStationForm((prev) => ({
          ...prev,
          region: detectRegionFromCoords(event.latlng.lat, event.latlng.lng),
          address: `Pinned location (${lat}, ${lon})`,
        }));
        setError("Could not resolve the address. Region was still filled from the map location.");
      } finally {
        if (stationReverseGeocodeRequestRef.current === requestId) {
          setStationMapPickerEnabled(false);
        }
      }
    };

    mapRef.current.on("click", handleMapClick);

    return () => {
      mapRef.current?.off("click", handleMapClick);
    };
  }, [activeSection, user?.isAdmin, stationMapPickerEnabled]);

  useEffect(() => {
    if (!mapRef.current || !markerLayerRef.current) {
      return;
    }

    const selectedStation = stations.find((station) => station.id === selectedStationId) ?? null;

    if (selectedStation && mapRoute?.path?.length) {
      const routePoints = mapRoute.path.map((point) => [point.lat, point.lon] as [number, number]);
      const bounds = L.latLngBounds(routePoints);
      mapRef.current.fitBounds(bounds.pad(0.18), { maxZoom: 15, animate: true });
      return;
    }

    if (selectedStation) {
      const bounds = L.latLngBounds(
        [
          [location.lat, location.lon],
          [selectedStation.latitude, selectedStation.longitude],
        ].map((point) => L.latLng(point[0], point[1])),
      );

      mapRef.current.fitBounds(bounds.pad(0.2), { maxZoom: 15, animate: true });
    }
  }, [selectedStationId, stations, location.lat, location.lon, mapRoute]);

  useEffect(() => {
    if (activeSection !== "estimator" || !estimatorMapHostRef.current || estimatorMapRef.current) {
      return;
    }

    const map = L.map(estimatorMapHostRef.current).setView([location.lat, location.lon], 13);
    L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}", {
      attribution:
        'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, IGN, Kadaster NL, Ordnance Survey, METI, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community',
    }).addTo(map);

    map.on("click", (event: L.LeafletMouseEvent) => {
      const pickedLat = event.latlng.lat;
      const pickedLon = event.latlng.lng;
      const requestId = reverseGeocodeRequestRef.current + 1;
      reverseGeocodeRequestRef.current = requestId;

      setTripDestination({ lat: pickedLat, lon: pickedLon });
      setTripForm((prev) => ({
        ...prev,
        destination: `Resolving place for ${pickedLat.toFixed(5)}, ${pickedLon.toFixed(5)}...`,
      }));

      setReverseGeocodingBusy(true);
      void reverseGeocode(pickedLat, pickedLon)
        .then((placeName) => {
          if (reverseGeocodeRequestRef.current !== requestId) {
            return;
          }

          setTripForm((prev) => ({
            ...prev,
            destination: placeName,
          }));
        })
        .catch(() => {
          if (reverseGeocodeRequestRef.current !== requestId) {
            return;
          }

          setTripForm((prev) => ({
            ...prev,
            destination: `Pinned destination (${pickedLat.toFixed(5)}, ${pickedLon.toFixed(5)})`,
          }));
        })
        .finally(() => {
          if (reverseGeocodeRequestRef.current === requestId) {
            setReverseGeocodingBusy(false);
          }
        });
    });

    estimatorMapRef.current = map;
    estimatorLayerRef.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      estimatorMapRef.current = null;
      estimatorLayerRef.current = null;
    };
  }, [activeSection, location.lat, location.lon]);

  useEffect(() => {
    if (!estimatorMapRef.current) {
      return;
    }

    estimatorMapRef.current.setView([location.lat, location.lon], estimatorMapRef.current.getZoom());
  }, [location.lat, location.lon]);

  useEffect(() => {
    if (!estimatorMapRef.current || !estimatorLayerRef.current) {
      return;
    }

    estimatorLayerRef.current.clearLayers();

    const currentMarker = L.marker([location.lat, location.lon], {
      icon: createPinIcon("You", "#0ea5e9"),
      riseOnHover: true,
    }).bindPopup("Current location");

    estimatorLayerRef.current.addLayer(currentMarker);

    if (!selectedDestination) {
      return;
    }

    const destinationMarker = L.marker([selectedDestination.lat, selectedDestination.lon], {
      icon: createPinIcon("Go", "#f97316"),
      riseOnHover: true,
    }).bindPopup(selectedDestination.name);

    estimatorLayerRef.current.addLayer(destinationMarker);

    const routePoints =
      routeEstimate?.path?.length
        ? routeEstimate.path.map((point) => [point.lat, point.lon] as [number, number])
        : [
            [location.lat, location.lon] as [number, number],
            [selectedDestination.lat, selectedDestination.lon] as [number, number],
          ];

    const routeLine = L.polyline(routePoints, {
      color: "#f97316",
      weight: 5,
      opacity: 0.92,
      lineCap: "round",
      lineJoin: "round",
    });
    estimatorLayerRef.current.addLayer(routeLine);

    const bounds = L.latLngBounds(routePoints);
    estimatorMapRef.current.fitBounds(bounds.pad(0.2), { maxZoom: 15, animate: true });
  }, [location.lat, location.lon, selectedDestination, routeEstimate]);

  useEffect(() => {
    if (!token) {
      setRouteEstimate(null);
      return;
    }

    if (!selectedDestination) {
      setRouteEstimate(null);
      return;
    }

    let isMounted = true;

    const fetchRoute = async () => {
      setRoutingBusy(true);

      try {
        const response = await client.post<RouteEstimate>(
          "/trips/route",
          {
            originLat: location.lat,
            originLon: location.lon,
            destinationLat: selectedDestination.lat,
            destinationLon: selectedDestination.lon,
          },
          { headers: authHeaders },
        );

        if (!isMounted) {
          return;
        }

        setRouteEstimate(response.data);
        setTripForm((prev) => ({
          ...prev,
          origin: "Current Location",
          destination: selectedDestination.name,
          distanceKm: response.data.distanceKm.toFixed(2),
        }));
      } catch {
        if (!isMounted) {
          return;
        }

        const fallbackDistance = haversineKm(location.lat, location.lon, selectedDestination.lat, selectedDestination.lon);
        setRouteEstimate(null);
        setTripForm((prev) => ({
          ...prev,
          origin: "Current Location",
          destination: selectedDestination.name,
          distanceKm: fallbackDistance.toFixed(2),
        }));
        setError("Road routing is temporarily unavailable. Using straight-line distance fallback.");
      } finally {
        if (isMounted) {
          setRoutingBusy(false);
        }
      }
    };

    void fetchRoute();

    return () => {
      isMounted = false;
    };
  }, [selectedDestination, authHeaders, token, location.lat, location.lon]);

  const latestGasolinePrices = stations
    .map((station) => getPreferredFuelPrice(station, "GASOLINE"))
    .filter(Boolean)
    .map((price) => toNumber(price!.pricePerLiter));

  const minPrice = latestGasolinePrices.length ? Math.min(...latestGasolinePrices) : 0;
  const maxPrice = latestGasolinePrices.length ? Math.max(...latestGasolinePrices) : 0;

  const markerColor = (price: number) => {
    if (!maxPrice || !minPrice) {
      return "#1d4ed8";
    }
    const ratio = (price - minPrice) / Math.max(maxPrice - minPrice, 1);
    if (ratio <= 0.35) {
      return "#16a34a";
    }
    if (ratio <= 0.7) {
      return "#f59e0b";
    }
    return "#dc2626";
  };

  useEffect(() => {
    if (!markerLayerRef.current) {
      return;
    }

    markerLayerRef.current.clearLayers();

    const selectedStation = stations.find((station) => station.id === selectedStationId) ?? null;
    const accuracyRadius = Math.max(locationAccuracyM ?? 30, 20);

    const accuracyCircle = L.circle([location.lat, location.lon], {
      radius: accuracyRadius,
      color: "#06b6d4",
      weight: 2,
      fillColor: "#67e8f9",
      fillOpacity: 0.18,
    }).bindPopup(`
      <strong>Your current location</strong><br/>
      Accuracy radius: ~${Math.round(accuracyRadius)}m
    `);

    markerLayerRef.current.addLayer(accuracyCircle);

    const currentLocationMarker = L.marker([location.lat, location.lon], {
      icon: createPinIcon("You", "#0ea5e9"),
      riseOnHover: true,
    }).bindPopup(`
      <strong>Your current location</strong><br/>
      Lat: ${location.lat.toFixed(5)}<br/>
      Lon: ${location.lon.toFixed(5)}<br/>
      ${locationAccuracyM != null ? `Accuracy: ~${Math.round(locationAccuracyM)}m` : ""}
    `);

    markerLayerRef.current.addLayer(currentLocationMarker);

    if (user?.isAdmin) {
      const pickedLatitude = Number(stationForm.latitude);
      const pickedLongitude = Number(stationForm.longitude);
      if (Number.isFinite(pickedLatitude) && Number.isFinite(pickedLongitude)) {
        const pickedMarker = L.marker([pickedLatitude, pickedLongitude], {
          icon: createPinIcon("New", "#f97316"),
          riseOnHover: true,
        }).bindPopup(`
          <strong>New station location</strong><br/>
          Lat: ${pickedLatitude.toFixed(5)}<br/>
          Lon: ${pickedLongitude.toFixed(5)}
        `);

        markerLayerRef.current.addLayer(pickedMarker);
      }
    }

    if (selectedStation) {
      const routePoints =
        mapRoute?.path?.length
          ? mapRoute.path.map((point) => [point.lat, point.lon] as [number, number])
          : [
              [location.lat, location.lon] as [number, number],
              [selectedStation.latitude, selectedStation.longitude] as [number, number],
            ];

      const routeLine = L.polyline(routePoints, {
        color: "#1d4ed8",
        weight: 6,
        opacity: 0.92,
        lineCap: "round",
        lineJoin: "round",
        dashArray: "8 10",
      });

      markerLayerRef.current.addLayer(routeLine);

      const selectedStationMarker = L.marker([selectedStation.latitude, selectedStation.longitude], {
        icon: createPinIcon("Fuel", "#7c3aed"),
        riseOnHover: true,
      }).bindPopup(`
        <strong>${selectedStation.name}</strong><br/>
        Selected station<br/>
        ${mapRoute ? `Driving route: ${mapRoute.distanceKm.toFixed(2)} km | ETA ${Math.round(mapRoute.durationMin)} min` : ""}
      `);

      markerLayerRef.current.addLayer(selectedStationMarker);
    } else {
      // no route selected yet; the accuracy circle and current pin stay visible
    }

    stations.forEach((station) => {
      const latestPrice = getPreferredFuelPrice(station, "GASOLINE");
      const gasolinePrice = latestPrice ? toNumber(latestPrice.pricePerLiter) : 0;
      const marker = L.marker([station.latitude, station.longitude], {
        icon: createPinIcon(station.id === selectedStationId ? "Fuel" : "Gas", station.id === selectedStationId ? "#7c3aed" : markerColor(gasolinePrice)),
        riseOnHover: true,
      });

      marker.bindPopup(`
        <strong>${station.name}</strong><br/>
        ${station.brand ? `Brand: ${station.brand}<br/>` : ""}
        Region: ${station.region}<br/>
        ${station.address ? `Address: ${station.address}<br/>` : ""}
        Gasoline: ${latestPrice ? `PHP ${gasolinePrice.toFixed(2)}` : "No data"}<br/>
        Distance: ${station.distanceKm != null ? `${station.distanceKm.toFixed(2)} km` : "-"}
      `);

      marker.on("click", () => {
        setSelectedStationId(station.id);
      });

      markerLayerRef.current?.addLayer(marker);
    });
  }, [stations, minPrice, maxPrice, selectedStationId, location.lat, location.lon, mapRoute, locationAccuracyM, user?.isAdmin, stationForm.latitude, stationForm.longitude]);

  const clearAuthForm = () => {
    setDisplayName("");
    setEmail("");
    setPassword("");
    setShowPassword(false);
    setAuthMode("login");
  };

  const handleRegister = async () => {
    setError("");
    if (password.trim().length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    try {
      const response = await client.post("/auth/register", { email, password, displayName });
      const nextToken = response.data.token as string;
      localStorage.setItem("tubil_token", nextToken);
      setToken(nextToken);
      setUser(response.data.user as AuthUser);
      setDashboardMode("user");
      clearAuthForm();
      setOkMessage("Welcome to Tubil. Your account is ready.");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const apiMessage = typeof error.response?.data?.message === "string" ? error.response.data.message : "Registration failed.";
        setError(apiMessage);
        return;
      }

      setError("Registration failed.");
    }
  };

  const handleLogin = async () => {
    setError("");
    const response = await client.post("/auth/login", { email, password });
    const loggedUser = response.data.user as AuthUser;

    const nextToken = response.data.token as string;
    localStorage.setItem("tubil_token", nextToken);
    setToken(nextToken);
    setUser(loggedUser);
    setDashboardMode(loggedUser.isAdmin ? "admin" : "user");
    setActiveSection(loggedUser.isAdmin ? "admin" : "map");
    clearAuthForm();
    setOkMessage("Login successful.");
  };

  const submitPrice = async () => {
    if (!selectedStationId) {
      return;
    }

    await client.post(
      "/stations/prices",
      {
        stationId: selectedStationId,
        fuelType: priceFuelType,
        pricePerLiter: Number(priceValue),
      },
      { headers: authHeaders },
    );

    setPriceValue("");
    await loadStations();
    setOkMessage("Price report submitted.");
  };

  const votePrice = async (priceId: string, isAccurate: boolean) => {
    setVotingPriceId(priceId);
    await client.post(`/stations/prices/${priceId}/votes`, { isAccurate }, { headers: authHeaders });
    await Promise.all([loadStations(), loadProtectedData()]);
    setVotingPriceId("");
    setOkMessage("Verification vote submitted.");
  };

  const createStation = async () => {
    const latitude = Number(stationForm.latitude);
    const longitude = Number(stationForm.longitude);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      throw new Error("Latitude and longitude must be valid numbers.");
    }

    const name = normalizeStationText(stationForm.name, 80);
    if (name.length < 2) {
      throw new Error("Station name must be at least 2 characters.");
    }

    const brand = normalizeStationText(stationForm.brand, 60);
    const address = normalizeStationText(stationForm.address, 180);
    const initialGasolinePriceText = stationForm.initialGasolinePrice.trim();
    let initialGasolinePrice: number | undefined;

    if (initialGasolinePriceText.length > 0) {
      const parsedPrice = Number(initialGasolinePriceText);
      if (!Number.isFinite(parsedPrice)) {
        throw new Error("Initial gasoline price must be a valid number.");
      }

      initialGasolinePrice = parsedPrice;
    }

    await client.post(
      "/stations",
      {
        name,
        brand: brand || null,
        latitude,
        longitude,
        region: stationForm.region,
        address: address || null,
        initialGasolinePrice,
      },
      { headers: authHeaders },
    );

    await loadStations();
    setOkMessage("Station created successfully.");
  };

  const updateStation = async () => {
    if (!selectedStationId || !selectedStation) {
      throw new Error("No station selected.");
    }

    const latitudeCandidate = Number(stationForm.latitude);
    const longitudeCandidate = Number(stationForm.longitude);
    const latitude = Number.isFinite(latitudeCandidate) ? latitudeCandidate : selectedStation.latitude;
    const longitude = Number.isFinite(longitudeCandidate) ? longitudeCandidate : selectedStation.longitude;
    const name = normalizeStationText(stationForm.name, 80) || selectedStation.name;
    const brand = normalizeStationText(stationForm.brand, 60);
    const address = normalizeStationText(stationForm.address, 180);

    console.log("Updating station:", { selectedStationId, name, region: stationForm.region, latitude, longitude });

    const payload = {
      name,
      brand: brand || null,
      latitude,
      longitude,
      region: stationForm.region || selectedStation.region,
      address: address || null,
    };

    console.log("Update payload:", payload);

    await client.put(
      `/stations/${selectedStationId}`,
      payload,
      { headers: authHeaders },
    );

    await loadStations();
    setOkMessage("Station updated successfully.");
  };

  const deleteStation = async () => {
    if (!selectedStationId) {
      return;
    }
    if (!confirm("Delete this station and its related entries?")) {
      return;
    }

    await client.delete(`/stations/${selectedStationId}`, { headers: authHeaders });
    setSelectedStationId("");
    await loadStations();
    setOkMessage("Station deleted successfully.");
  };

  const handleCreateStation = async () => {
    try {
      await createStation();
    } catch (error) {
      setError(getApiErrorMessage(error, "Station create failed."));
    }
  };

  const handleUpdateStation = async () => {
    try {
      await updateStation();
    } catch (error) {
      const msg = getApiErrorMessage(error, "Station update failed.");
      console.error("Update station error:", error, "Message:", msg);
      setError(msg);
    }
  };

  const handleDeleteStation = async () => {
    try {
      await deleteStation();
    } catch (error) {
      setError(getApiErrorMessage(error, "Station delete failed."));
    }
  };

  const updateStationFormField = <K extends keyof typeof stationForm>(field: K, value: (typeof stationForm)[K]) => {
    setStationFormDirty(true);
    setStationForm((prev) => ({ ...prev, [field]: value }));
  };

  const createPreset = () => {
    const name = presetForm.name.trim();
    if (!name) {
      setError("Preset name is required.");
      return;
    }

    const nextPreset: UnitPreset = {
      name,
      fuelType: presetForm.fuelType,
      efficiencyKmPerL: Number(presetForm.efficiencyKmPerL),
      category: presetForm.category,
    };

    setGaragePresets((prev) => {
      if (prev.some((item) => item.name.toLowerCase() === name.toLowerCase())) {
        return prev;
      }
      return [nextPreset, ...prev];
    });
    setPresetForm({ name: "", fuelType: "GASOLINE", efficiencyKmPerL: 10, category: "Vehicle" });
    setOkMessage("Popular unit added.");
  };

  const updatePreset = () => {
    if (!editingPresetName) {
      return;
    }

    const nextName = presetForm.name.trim();
    if (!nextName) {
      setError("Preset name is required.");
      return;
    }

    const nextPreset: UnitPreset = {
      name: nextName,
      fuelType: presetForm.fuelType,
      efficiencyKmPerL: Number(presetForm.efficiencyKmPerL),
      category: presetForm.category,
    };

    setGaragePresets((prev) =>
      prev.map((item) => (item.name === editingPresetName ? nextPreset : item)),
    );
    setEditingPresetName(null);
    setPresetForm({ name: "", fuelType: "GASOLINE", efficiencyKmPerL: 10, category: "Vehicle" });
    setOkMessage("Popular unit updated.");
  };

  const deletePreset = (presetName: string) => {
    if (!confirm(`Delete ${presetName} from popular units?`)) {
      return;
    }

    setGaragePresets((prev) => prev.filter((item) => item.name !== presetName));
    if (editingPresetName === presetName) {
      setEditingPresetName(null);
      setPresetForm({ name: "", fuelType: "GASOLINE", efficiencyKmPerL: 10, category: "Vehicle" });
    }
    setOkMessage("Popular unit deleted.");
  };

  const addVehicle = async () => {
    const response = await client.post(
      "/vehicles",
      {
        name: vehicleForm.name,
        fuelType: vehicleForm.fuelType,
        efficiencyKmPerL: Number(vehicleForm.efficiencyKmPerL),
        isPrimary: vehicles.length === 0,
      },
      { headers: authHeaders },
    );

    const nextVehicles = [response.data.vehicle as Vehicle, ...vehicles];
    setVehicles(nextVehicles);
    setVehicleForm({ name: "", fuelType: "GASOLINE", efficiencyKmPerL: "" });
    setTripForm((prev) => ({ ...prev, vehicleId: response.data.vehicle.id as string }));
    setRefuelForm((prev) => ({ ...prev, vehicleId: response.data.vehicle.id as string }));
  };

  const addPresetUnit = async (preset: UnitPreset) => {
    const response = await client.post(
      "/vehicles",
      {
        name: preset.name,
        fuelType: preset.fuelType,
        efficiencyKmPerL: preset.efficiencyKmPerL,
        isPrimary: vehicles.length === 0,
      },
      { headers: authHeaders },
    );

    setVehicles((prev) => [response.data.vehicle as Vehicle, ...prev]);
    setOkMessage(`${preset.name} added. Photo placeholder ready for future image upload.`);
  };

  const estimateTrip = async () => {
    await client.post(
      "/trips/estimate",
      {
        ...tripForm,
        distanceKm: Number(tripForm.distanceKm),
        durationMin: routeEstimate ? Number(routeEstimate.durationMin) : undefined,
        fuelPricePerLiter: Number(tripForm.fuelPricePerLiter),
      },
      { headers: authHeaders },
    );

    const response = await client.get<{ trips: Trip[] }>("/trips", { headers: authHeaders });
    setTrips(response.data.trips);
  };

  const addRefuel = async () => {
    await client.post(
      "/refuels",
      {
        ...refuelForm,
        liters: Number(refuelForm.liters),
        totalCost: Number(refuelForm.totalCost),
      },
      { headers: authHeaders },
    );

    const response = await client.get<{ refuels: Refuel[] }>("/refuels", { headers: authHeaders });
    setRefuels(response.data.refuels);
    setRefuelForm((prev) => ({ ...prev, liters: "", totalCost: "" }));
  };

  const updateVehicle = async (vehicleId: string) => {
    await client.put(
      `/vehicles/${vehicleId}`,
      {
        name: editingVehicleForm.name,
        fuelType: editingVehicleForm.fuelType,
        efficiencyKmPerL: Number(editingVehicleForm.efficiencyKmPerL),
      },
      { headers: authHeaders },
    );

    const response = await client.get<{ vehicles: Vehicle[] }>("/vehicles", { headers: authHeaders });
    setVehicles(response.data.vehicles);
    setEditingVehicleId(null);
    setEditingVehicleForm({ name: "", fuelType: "GASOLINE", efficiencyKmPerL: "" });
    setOkMessage("Vehicle updated successfully.");
  };

  const deleteVehicle = async (vehicleId: string) => {
    if (!confirm("Are you sure you want to delete this vehicle?")) {
      return;
    }

    await client.delete(`/vehicles/${vehicleId}`, { headers: authHeaders });

    const response = await client.get<{ vehicles: Vehicle[] }>("/vehicles", { headers: authHeaders });
    setVehicles(response.data.vehicles);
    setOkMessage("Vehicle deleted successfully.");
  };

  const updateRefuel = async (refuelId: string) => {
    await client.put(
      `/refuels/${refuelId}`,
      {
        vehicleId: editingRefuelForm.vehicleId,
        stationId: editingRefuelForm.stationId,
        liters: Number(editingRefuelForm.liters),
        totalCost: Number(editingRefuelForm.totalCost),
      },
      { headers: authHeaders },
    );

    const response = await client.get<{ refuels: Refuel[] }>("/refuels", { headers: authHeaders });
    setRefuels(response.data.refuels);
    setEditingRefuelId(null);
    setEditingRefuelForm({ vehicleId: "", stationId: "", liters: "", totalCost: "" });
    setOkMessage("Refuel record updated successfully.");
  };

  const deleteRefuel = async (refuelId: string) => {
    if (!confirm("Are you sure you want to delete this refuel record?")) {
      return;
    }

    await client.delete(`/refuels/${refuelId}`, { headers: authHeaders });

    const response = await client.get<{ refuels: Refuel[] }>("/refuels", { headers: authHeaders });
    setRefuels(response.data.refuels);
    setOkMessage("Refuel record deleted successfully.");
  };

  const importStations = async () => {
    setImportingStations(true);
    await client.post("/stations/import", {}, { headers: authHeaders });
    await loadStations();
    setImportingStations(false);
    setOkMessage("Station import completed successfully.");
  };

  const logout = () => {
    localStorage.removeItem("tubil_token");
    setToken("");
    setUser(null);
    setProfilePhotoDataUrl("");
    setStations([]);
    setSelectedStationId("");
    setMapRoute(null);
    setVehicles([]);
    setTrips([]);
    setRefuels([]);
    setLeaderboard([]);
    setActiveSection("map");
    setDashboardMode("user");
    clearAuthForm();
  };

  const canManageAdminContent = Boolean(user?.isAdmin);

  const selectedStation = selectedStationId
    ? (stations.find((station) => station.id === selectedStationId) ?? null)
    : (stations[0] ?? null);
  const selectedStationPrices = selectedStation?.fuelPrices ?? [];
  const nearestStation = stations[0] ?? null;

  useEffect(() => {
    if (!selectedStation) {
      return;
    }

    const stationChanged = lastStationFormSyncIdRef.current !== selectedStation.id;
    if (!stationChanged && stationFormDirty) {
      return;
    }

    setStationForm({
      name: selectedStation.name,
      brand: selectedStation.brand ?? "",
      latitude: String(selectedStation.latitude),
      longitude: String(selectedStation.longitude),
      region: selectedStation.region,
      address: selectedStation.address ?? "",
      initialGasolinePrice: "",
    });
    setStationFormDirty(false);
    lastStationFormSyncIdRef.current = selectedStation.id;
  }, [selectedStation, stationFormDirty]);

  const roleChip = user?.isAdmin ? "ADMIN" : "USER";
  const userInitial = (user?.displayName ?? user?.email ?? "U").trim().charAt(0).toUpperCase();
  const dashboardTitle = dashboardMode === "admin" ? "Admin Dashboard" : "Driver Dashboard";
  const moduleCardSx = getModuleCardSx(darkMode);

  const sections = getSectionsForDashboard(Boolean(dashboardMode === "admin" && user?.isAdmin));
  const activeSectionLabel = sections.find((section) => section.key === activeSection)?.label ?? "Dashboard";
  const appBarSx = getAppBarSx(darkMode);

  useEffect(() => {
    if (!authResolved) {
      return;
    }

    localStorage.setItem("tubil_active_section", activeSection);
  }, [activeSection, authResolved]);

  useEffect(() => {
    if (!authResolved) {
      return;
    }

    const allowedSections = sections.map((section) => section.key);
    if (!allowedSections.includes(activeSection)) {
      setActiveSection(allowedSections[0]);
    }
  }, [sections, activeSection, authResolved]);

  const submitAuth = () => {
    if (authMode === "register") {
      handleRegister().catch(() => setError("Registration failed."));
      return;
    }

    handleLogin().catch(() => setError("Login failed."));
  };

  if (!token) {
    return (
      <ThemeProvider theme={appTheme}>
        <CssBaseline />
        <Box className="tubil-shell" sx={{ minHeight: "100vh" }}>
          {renderAmbientBackground()}
          <AppBar position="sticky" sx={appBarSx}>
            <Toolbar sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>Tubil</Typography>
              <Stack direction="row" spacing={1} sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
                <Switch
                  checked={darkMode}
                  onChange={(event) => setDarkMode(event.target.checked)}
                  color="default"
                  icon={renderBulbSwitchGlyph(false)}
                  checkedIcon={renderBulbSwitchGlyph(true)}
                  slotProps={{ input: { "aria-label": "Toggle dark mode" } }}
                />
                <Chip
                  label="Bohol First"
                  sx={{
                    bgcolor: darkMode ? "rgba(249, 214, 110, 0.14)" : "rgba(184, 115, 51, 0.1)",
                    color: darkMode ? "#fde68a" : "#8f5a22",
                    border: darkMode ? "1px solid rgba(249, 214, 110, 0.18)" : "1px solid rgba(184, 115, 51, 0.14)",
                  }}
                />
              </Stack>
            </Toolbar>
          </AppBar>
          <LandingView
            darkMode={darkMode}
            authMode={authMode}
            setAuthMode={setAuthMode}
            displayName={displayName}
            setDisplayName={setDisplayName}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            onSubmitAuth={submitAuth}
          />
          {error ? <Alert severity="error" sx={{ maxWidth: 720, mx: "auto", mb: 2 }} onClose={() => setError("")}>{error}</Alert> : null}
          {okMessage ? <Alert severity="success" sx={{ maxWidth: 720, mx: "auto", mb: 2 }} onClose={() => setOkMessage("")}>{okMessage}</Alert> : null}
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <Box className="tubil-shell" sx={{ minHeight: "100vh" }}>
        {renderAmbientBackground()}
        <input ref={profilePhotoInputRef} hidden type="file" accept="image/*,.gif" onChange={onProfilePhotoChange} />
        <Dialog open={profileImagePreviewOpen} onClose={() => setProfileImagePreviewOpen(false)} maxWidth="sm" fullWidth>
          <DialogContent sx={{ p: 2 }}>
            <Box
              component="img"
              src={profilePhotoDataUrl || "https://placehold.co/1024x1024/e2e8f0/334155?text=Profile"}
              alt="Profile preview"
              sx={{
                width: "100%",
                maxHeight: "70vh",
                objectFit: "contain",
                borderRadius: 2,
                border: `1px solid ${darkMode ? "rgba(148, 163, 184, 0.18)" : "#cbd5e1"}`,
                bgcolor: darkMode ? "#111827" : "#f8fafc",
              }}
            />
          </DialogContent>
        </Dialog>
        <AppBar position="sticky" sx={appBarSx}>
          <Toolbar sx={{ display: "flex", justifyContent: "space-between", gap: 1, flexWrap: { xs: "wrap", md: "nowrap" } }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: -0.4 }}>{dashboardTitle}</Typography>
              <Typography
                variant="caption"
                sx={{
                  opacity: 0.92,
                  display: "block",
                  whiteSpace: { xs: "normal", md: "nowrap" },
                  lineHeight: 1.3,
                }}
              >
                Panglao and Dauis fuel intelligence platform
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end", rowGap: 0.8 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  px: 1,
                  borderRadius: 999,
                  border: darkMode ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(15, 23, 42, 0.08)",
                  bgcolor: darkMode ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.64)",
                }}
              >
                <Switch
                  checked={darkMode}
                  onChange={(event) => setDarkMode(event.target.checked)}
                  color="default"
                  icon={renderBulbSwitchGlyph(false)}
                  checkedIcon={renderBulbSwitchGlyph(true)}
                  slotProps={{ input: { "aria-label": "Toggle dark mode" } }}
                />
              </Box>
              {profilePhotoDataUrl ? (
                <Box
                  component="img"
                  src={profilePhotoDataUrl}
                  alt="Profile"
                  role="button"
                  tabIndex={0}
                  aria-label="Open profile image preview"
                  onClick={openProfilePhotoPreview}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      openProfilePhotoPreview();
                    }
                  }}
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: darkMode ? "2px solid rgba(249, 214, 110, 0.36)" : "2px solid rgba(184, 115, 51, 0.24)",
                    cursor: "pointer",
                  }}
                />
              ) : (
                <Box
                  role="button"
                  tabIndex={0}
                  aria-label="Open profile image preview"
                  onClick={openProfilePhotoPreview}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      openProfilePhotoPreview();
                    }
                  }}
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    display: "grid",
                    placeItems: "center",
                    fontWeight: 700,
                    fontSize: 14,
                    color: darkMode ? "#f7fbff" : "#10212f",
                    bgcolor: darkMode ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.76)",
                    border: darkMode ? "2px solid rgba(255,255,255,0.12)" : "2px solid rgba(15, 23, 42, 0.08)",
                    cursor: "pointer",
                  }}
                >
                  {userInitial}
                </Box>
              )}
              <Chip
                label={`Role: ${roleChip}`}
                sx={{
                  bgcolor: user?.isAdmin ? (darkMode ? "rgba(249, 214, 110, 0.16)" : "rgba(184, 115, 51, 0.12)") : darkMode ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.72)",
                  color: user?.isAdmin ? (darkMode ? "#fde68a" : "#8f5a22") : darkMode ? "#bac8dd" : "#516273",
                  border: darkMode ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(15, 23, 42, 0.08)",
                }}
              />
              <Chip label={`Points: ${user?.points ?? 0}`} sx={{ bgcolor: darkMode ? "rgba(249, 214, 110, 0.16)" : "rgba(184, 115, 51, 0.12)", color: darkMode ? "#fde68a" : "#8f5a22" }} />
              <Chip label={`Trust: ${(((user?.reliabilityScore ?? 0) * 100).toFixed(0))}%`} sx={{ bgcolor: darkMode ? "rgba(125, 211, 252, 0.14)" : "rgba(37, 99, 235, 0.1)", color: darkMode ? "#bae6fd" : "#1d4ed8" }} />
              <Button
                variant="outlined"
                color="inherit"
                sx={{
                  borderColor: darkMode ? "rgba(255,255,255,0.12)" : "rgba(15, 23, 42, 0.08)",
                  bgcolor: darkMode ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.72)",
                  color: darkMode ? "inherit" : "#10212f",
                }}
                onClick={logout}
              >
                Logout
              </Button>
            </Stack>
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3 }, display: "grid", gap: 2 }}>
          <Card sx={{ borderRadius: 2, overflow: "hidden", border: darkMode ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(15,23,42,0.08)" }}>
            <Box sx={{ p: { xs: 2, md: 2.5 }, color: darkMode ? "#f7fbff" : "#10212f", background: darkMode ? "linear-gradient(135deg, rgba(3, 7, 16, 0.98) 0%, rgba(8, 15, 30, 0.96) 48%, rgba(12, 22, 41, 0.97) 100%)" : "linear-gradient(135deg, rgba(255, 251, 244, 0.95) 0%, rgba(248, 241, 228, 0.93) 48%, rgba(238, 230, 214, 0.94) 100%)" }}>
              <Grid container spacing={2} sx={{ alignItems: "center" }}>
                <Grid size={{ xs: 12, md: 8 }}>
                  <Typography variant="overline" sx={{ letterSpacing: 1.4, opacity: 0.98, color: darkMode ? "#fde68a" : "#7c4a1c", fontWeight: 700 }}>
                    Active workspace
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: darkMode ? "#f8fbff" : "#10212f", textShadow: darkMode ? "0 1px 8px rgba(2,5,11,0.35)" : "none" }}>
                    {activeSectionLabel}
                  </Typography>
                  <Typography variant="body2" sx={{ color: darkMode ? "#dbe6f7" : "#475569", fontWeight: 500 }}>
                    {sectionDescriptions[activeSection]}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Stack direction="row" spacing={1} sx={{ justifyContent: { xs: "flex-start", md: "flex-end" }, flexWrap: "wrap" }}>
                    <Chip label={`Stations: ${stations.length}`} sx={{ bgcolor: darkMode ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.82)", color: darkMode ? "#e6eefc" : "#334155", border: darkMode ? "1px solid rgba(255,255,255,0.18)" : "1px solid rgba(15, 23, 42, 0.12)", fontWeight: 650 }} />
                    <Chip label={`Units: ${vehicles.length}`} sx={{ bgcolor: darkMode ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.82)", color: darkMode ? "#e6eefc" : "#334155", border: darkMode ? "1px solid rgba(255,255,255,0.18)" : "1px solid rgba(15, 23, 42, 0.12)", fontWeight: 650 }} />
                    <Chip label={`Trips: ${trips.length}`} sx={{ bgcolor: darkMode ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.82)", color: darkMode ? "#e6eefc" : "#334155", border: darkMode ? "1px solid rgba(255,255,255,0.18)" : "1px solid rgba(15, 23, 42, 0.12)", fontWeight: 650 }} />
                  </Stack>
                </Grid>
              </Grid>
            </Box>
            <CardContent sx={{ background: darkMode ? "rgba(6, 10, 20, 0.68)" : "rgba(255, 252, 247, 0.86)" }}>
              <Stack direction="row" spacing={1} className="tubil-nav-scroll" sx={{ flexWrap: { xs: "nowrap", md: "wrap" }, overflowX: { xs: "auto", md: "visible" }, pb: { xs: 0.5, md: 0 }, pr: { xs: 1, md: 0 } }}>
                {sections.map((section) => (
                  <Button
                    key={section.key}
                    variant={activeSection === section.key ? "contained" : "outlined"}
                    onClick={() => setActiveSection(section.key)}
                    sx={{
                      minWidth: { xs: 132, md: 128 },
                      borderRadius: 999,
                      borderWidth: 1.5,
                      bgcolor: activeSection === section.key ? (darkMode ? "#f9d66e" : "#b87333") : (darkMode ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.72)"),
                      color: activeSection === section.key ? (darkMode ? "#10212f" : "#ffffff") : (darkMode ? "#bac8dd" : "#516273"),
                      borderColor: activeSection === section.key ? (darkMode ? "rgba(249, 214, 110, 0.42)" : "rgba(184, 115, 51, 0.32)") : (darkMode ? "rgba(255,255,255,0.08)" : "rgba(15, 23, 42, 0.08)"),
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                      transition: "all 200ms ease-in-out",
                      "&:hover": {
                        bgcolor: activeSection === section.key ? (darkMode ? "#f4c95e" : "#9e6324") : (darkMode ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.88)"),
                        borderColor: activeSection === section.key ? (darkMode ? "rgba(249, 214, 110, 0.56)" : "rgba(184, 115, 51, 0.42)") : (darkMode ? "rgba(255,255,255,0.14)" : "rgba(15, 23, 42, 0.12)"),
                      },
                    }}
                  >
                    {section.label}
                  </Button>
                ))}
              </Stack>
            </CardContent>
          </Card>

          <Box sx={{ position: "relative" }}>
            <Suspense fallback={<SectionLoadingFallback darkMode={darkMode} />}>
              <DashboardSectionContent
              activeSection={activeSection}
              moduleCardSx={moduleCardSx}
              darkMode={darkMode}
              importingStations={importingStations}
              importStations={importStations}
              setError={setError}
              routeLoading={routeLoading}
              mapRoute={mapRoute}
              locationAccuracyM={locationAccuracyM}
              mapHostRef={mapHostRef}
              locating={locating}
              detectLocation={detectLocation}
              location={location}
              canManageAdminContent={canManageAdminContent}
              stationForm={stationForm}
              updateStationFormField={updateStationFormField}
              stationMapPickerEnabled={stationMapPickerEnabled}
              setStationMapPickerEnabled={setStationMapPickerEnabled}
              handleCreateStation={handleCreateStation}
              handleUpdateStation={handleUpdateStation}
              handleDeleteStation={handleDeleteStation}
              selectedStationId={selectedStationId}
              nearestStation={nearestStation}
              selectedStation={selectedStation}
              stations={stations}
              setSelectedStationId={setSelectedStationId}
              getMapGasolinePrice={(station) => getPreferredFuelPrice(station, "GASOLINE")}
              routingBusy={routingBusy}
              routeEstimate={routeEstimate}
              tripForm={tripForm}
              reverseGeocodingBusy={reverseGeocodingBusy}
              estimatorMapHostRef={estimatorMapHostRef}
              setTripForm={setTripForm}
              vehicles={vehicles}
              estimateTrip={estimateTrip}
              trips={trips}
              refuelForm={refuelForm}
              setRefuelForm={setRefuelForm}
              addRefuel={addRefuel}
              refuels={refuels}
              editingRefuelId={editingRefuelId}
              editingRefuelForm={editingRefuelForm}
              setEditingRefuelId={setEditingRefuelId}
              setEditingRefuelForm={setEditingRefuelForm}
              updateRefuel={updateRefuel}
              deleteRefuel={deleteRefuel}
              fuelTypes={fuelTypes}
              garagePresets={garagePresets}
              unitImageMap={unitImageMap}
              imageFallback={imageFallback}
              presetForm={presetForm}
              setPresetForm={setPresetForm}
              editingPresetName={editingPresetName}
              setEditingPresetName={setEditingPresetName}
              createPreset={createPreset}
              updatePreset={updatePreset}
              deletePreset={deletePreset}
              addPresetUnit={addPresetUnit}
              vehicleForm={vehicleForm}
              setVehicleForm={setVehicleForm}
              addVehicle={addVehicle}
              editingVehicleId={editingVehicleId}
              editingVehicleForm={editingVehicleForm}
              setEditingVehicleId={setEditingVehicleId}
              setEditingVehicleForm={setEditingVehicleForm}
              updateVehicle={updateVehicle}
              deleteVehicle={deleteVehicle}
              priceFuelType={priceFuelType}
              setPriceFuelType={setPriceFuelType}
              priceValue={priceValue}
              setPriceValue={setPriceValue}
              submitPrice={submitPrice}
              selectedStationPrices={selectedStationPrices}
              votingPriceId={votingPriceId}
              votePrice={votePrice}
              leaderboard={leaderboard}
              user={user}
              profilePhotoDataUrl={profilePhotoDataUrl}
              openProfilePhotoPreview={openProfilePhotoPreview}
              openProfilePhotoPicker={openProfilePhotoPicker}
              removeProfilePhoto={removeProfilePhoto}
              currentLocationName={currentLocationName}
              formatPrice={(value) => toNumber(value).toFixed(2)}
              formatCost={(value) => toNumber(value).toFixed(2)}
              />
            </Suspense>
          </Box>

          {error ? (
            <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError("")}>
              {error}
            </Alert>
          ) : null}

          {okMessage ? (
            <Alert severity="success" sx={{ mt: 2 }} onClose={() => setOkMessage("")}>
              {okMessage}
            </Alert>
          ) : null}
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;

