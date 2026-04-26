import { Box, Button, Card, CardContent, Chip, FormControl, Grid, InputLabel, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import type React from "react";
import type { Region, Station } from "../types";

type StationForm = {
  name: string;
  brand: string;
  latitude: string;
  longitude: string;
  region: Region;
  address: string;
  initialGasolinePrice: string;
};

type MapRoute = {
  distanceKm: number;
  durationMin: number;
};

type LiveMapSectionProps = {
  darkMode: boolean;
  routeLoading: boolean;
  mapRoute: MapRoute | null;
  locationAccuracyM: number | null;
  mapHostRef: React.RefObject<HTMLDivElement | null>;
  locating: boolean;
  detectLocation: () => void;
  location: { lat: number; lon: number };
  canManageAdminContent: boolean;
  stationForm: StationForm;
  updateStationFormField: <K extends keyof StationForm>(field: K, value: StationForm[K]) => void;
  stationMapPickerEnabled: boolean;
  setStationMapPickerEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  handleCreateStation: () => Promise<void>;
  handleUpdateStation: () => Promise<void>;
  handleDeleteStation: () => Promise<void>;
  selectedStationId: string;
  nearestStation: Station | null;
  selectedStation: Station | null;
  stations: Station[];
  setSelectedStationId: React.Dispatch<React.SetStateAction<string>>;
  getPreferredFuelPrice: (station: Station) => { pricePerLiter: string | number } | null;
  formatPrice: (value: string | number) => string;
};

export const LiveMapSection = ({
  darkMode,
  routeLoading,
  mapRoute,
  locationAccuracyM,
  mapHostRef,
  locating,
  detectLocation,
  location,
  canManageAdminContent,
  stationForm,
  updateStationFormField,
  stationMapPickerEnabled,
  setStationMapPickerEnabled,
  handleCreateStation,
  handleUpdateStation,
  handleDeleteStation,
  selectedStationId,
  nearestStation,
  selectedStation,
  stations,
  setSelectedStationId,
  getPreferredFuelPrice,
  formatPrice,
}: LiveMapSectionProps) => {
  return (
    <Grid container spacing={{ xs: 1.25, md: 2 }}>
      <Grid size={{ xs: 12, md: 8 }} sx={{ alignSelf: "flex-start" }}>
        <Card
          sx={{
            borderRadius: 2,
            overflow: "hidden",
            position: { xs: "relative", md: "sticky" },
            top: { xs: 0, md: 88 },
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: { xs: 10, md: 16 },
              left: { xs: 10, md: 16 },
              zIndex: 500,
              display: "flex",
              flexWrap: "wrap",
              gap: 0.8,
            }}
          >
            <Chip size="small" label={routeLoading ? "Routing..." : mapRoute ? `Road route: ${mapRoute.distanceKm.toFixed(1)} km` : "Tap a station"} sx={{ bgcolor: "rgba(15, 23, 42, 0.88)", color: "white" }} />
            <Chip size="small" label={`GPS ${locationAccuracyM != null ? `~${Math.round(locationAccuracyM)}m` : "unknown"}`} sx={{ bgcolor: "rgba(15, 23, 42, 0.88)", color: "white" }} />
          </Box>
          <Box ref={mapHostRef} sx={{ height: { xs: 320, md: 520 } }} />
        </Card>
      </Grid>
      <Grid size={{ xs: 12, md: 4 }} sx={{ alignSelf: "flex-start" }}>
        <Card
          sx={{
            borderRadius: 2,
            overflow: "hidden",
            height: { xs: "auto", md: "520px" },
            display: "flex",
            flexDirection: "column",
            bgcolor: darkMode ? "#0b1220" : "#ffffff",
            border: `1px solid ${darkMode ? "rgba(148, 163, 184, 0.22)" : "rgba(148, 163, 184, 0.26)"}`,
          }}
        >
          <Box sx={{ p: 2, bgcolor: darkMode ? "#111827" : "#0f172a", color: "white" }}>
            <Typography variant="overline" sx={{ letterSpacing: 1.4, opacity: 0.8 }}>
              Route Preview
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Current location to selected station
            </Typography>
          </Box>
          <CardContent
            sx={{
              flex: { xs: "initial", md: 1 },
              overflowY: { xs: "visible", md: "auto" },
              overscrollBehaviorY: { xs: "auto", md: "contain" },
              pr: { xs: 1.4, md: 1.5 },
              pl: { xs: 1.4, md: 2 },
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: "1rem", md: "1.25rem" } }}>
              Nearby Stations
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mb: 1.2 }}>
              <Button size="small" fullWidth={true} variant="contained" disabled={locating} onClick={detectLocation} sx={{ bgcolor: darkMode ? "#f9d66e" : "#b87333", color: darkMode ? "#10212f" : "#ffffff", fontWeight: 700, border: darkMode ? "1px solid rgba(249, 214, 110, 0.5)" : "1px solid rgba(184, 115, 51, 0.72)", "&:hover": { bgcolor: darkMode ? "#f4c95e" : "#9e6324" }, "&:disabled": { bgcolor: darkMode ? "rgba(249, 214, 110, 0.35)" : "rgba(184, 115, 51, 0.45)", color: darkMode ? "rgba(16,33,47,0.8)" : "rgba(255,255,255,0.78)" } }}>
                {locating ? "Detecting..." : "Refresh My Location"}
              </Button>
            </Stack>
            <Typography variant="caption" sx={{ display: "block", color: darkMode ? "#94a3b8" : "#475569", mb: 1 }}>
              {routeLoading ? "Drawing route to selected station..." : mapRoute ? `Route ready: ${mapRoute.distanceKm.toFixed(2)} km` : "Tap a station to draw a route."}
            </Typography>
            <Typography variant="caption" sx={{ display: "block", color: darkMode ? "#94a3b8" : "#475569", mb: 1 }}>
              Location: {location.lat.toFixed(5)}, {location.lon.toFixed(5)}
              {locationAccuracyM != null ? ` | Accuracy ~${Math.round(locationAccuracyM)}m` : ""}
            </Typography>
            {canManageAdminContent ? (
              <Box sx={{ p: 1.1, borderRadius: 2, bgcolor: darkMode ? "#0f172a" : "#ecfeff", mb: 1, border: `1px solid ${darkMode ? "rgba(148, 163, 184, 0.18)" : "#67e8f9"}` }}>
                <Typography variant="subtitle2" sx={{ mb: 0.8 }}>
                  Admin Station CRUD
                </Typography>
                <Grid container spacing={0.8}>
                  <Grid size={{ xs: 12 }}>
                    <TextField fullWidth label="Station Name" value={stationForm.name} onChange={(event) => updateStationFormField("name", event.target.value)} />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField fullWidth label="Brand" value={stationForm.brand} onChange={(event) => updateStationFormField("brand", event.target.value)} />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <TextField fullWidth label="Latitude" value={stationForm.latitude} onChange={(event) => updateStationFormField("latitude", event.target.value)} />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <TextField fullWidth label="Longitude" value={stationForm.longitude} onChange={(event) => updateStationFormField("longitude", event.target.value)} />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Button
                      type="button"
                      size="small"
                      fullWidth={true}
                      variant={stationMapPickerEnabled ? "contained" : "outlined"}
                      color={stationMapPickerEnabled ? "warning" : "primary"}
                      onClick={() => setStationMapPickerEnabled((prev) => !prev)}
                    >
                      {stationMapPickerEnabled ? "Click map to pick location (armed)" : "Pick Latitude/Longitude from Map"}
                    </Button>
                    <Typography variant="caption" sx={{ display: "block", color: darkMode ? "#94a3b8" : "#475569", mt: 0.6 }}>
                      {stationMapPickerEnabled
                        ? "Tap once on the map to save coordinates into the form."
                        : "You can still type coordinates manually if preferred."}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <FormControl fullWidth>
                      <InputLabel>Region</InputLabel>
                      <Select
                        label="Region"
                        value={stationForm.region}
                        onChange={(event) => updateStationFormField("region", event.target.value as Region)}
                      >
                        <MenuItem value="DAUIS">DAUIS</MenuItem>
                        <MenuItem value="PANGLAO">PANGLAO</MenuItem>
                        <MenuItem value="BOHOL_PROPER">BOHOL_PROPER</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField fullWidth label="Address" value={stationForm.address} onChange={(event) => updateStationFormField("address", event.target.value)} />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Initial Gasoline Price (optional)"
                      value={stationForm.initialGasolinePrice}
                      onChange={(event) => updateStationFormField("initialGasolinePrice", event.target.value)}
                    />
                  </Grid>
                </Grid>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={0.8} sx={{ mt: 1 }}>
                  <Button type="button" size="small" fullWidth={true} variant="contained" onClick={handleCreateStation}>Create</Button>
                  <Button type="button" size="small" fullWidth={true} variant="outlined" onClick={handleUpdateStation} disabled={!selectedStationId}>Update Selected</Button>
                  <Button type="button" size="small" fullWidth={true} variant="outlined" color="error" onClick={handleDeleteStation} disabled={!selectedStationId}>Delete Selected</Button>
                </Stack>
              </Box>
            ) : null}
            {nearestStation ? (
              <Box sx={{ p: 1.1, borderRadius: 2, bgcolor: darkMode ? "#0f172a" : "#e2fbe8", mb: 1, border: `1px solid ${darkMode ? "rgba(148, 163, 184, 0.18)" : "#86efac"}` }}>
                <Typography variant="subtitle2">Nearest: {nearestStation.name}</Typography>
                <Typography variant="caption" sx={{ color: darkMode ? "#86efac" : "#166534" }}>
                  {nearestStation.distanceKm != null ? `${nearestStation.distanceKm.toFixed(2)} km away` : "Distance unavailable"}
                </Typography>
              </Box>
            ) : null}
            {selectedStation ? (
              <Box sx={{ p: 1.1, borderRadius: 2, bgcolor: darkMode ? "rgba(14, 23, 42, 0.76)" : "#fff7e8", mb: 1, border: `1px solid ${darkMode ? "rgba(249, 214, 110, 0.26)" : "rgba(184, 115, 51, 0.34)"}` }}>
                <Typography variant="subtitle2" sx={{ color: darkMode ? "#f7fbff" : "#10212f" }}>Selected: {selectedStation.name}</Typography>
                <Typography variant="caption" sx={{ color: darkMode ? "#fde68a" : "#8f5a22", display: "block" }}>
                  {mapRoute ? `${mapRoute.distanceKm.toFixed(2)} km | ${Math.round(mapRoute.durationMin)} min` : "Route loading..."}
                </Typography>
                <Typography variant="caption" sx={{ color: darkMode ? "#94a3b8" : "#334155", display: "block" }}>
                  {selectedStation.brand ? `Brand: ${selectedStation.brand} | ` : ""}
                  {selectedStation.address ?? selectedStation.region}
                </Typography>
              </Box>
            ) : null}
            <Stack spacing={{ xs: 0.8, md: 1 }}>
              {stations.slice(0, 12).map((station) => {
                const gas = getPreferredFuelPrice(station);
                return (
                  <Box
                    key={station.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`Select station ${station.name}`}
                    aria-pressed={station.id === selectedStationId}
                    onClick={() => setSelectedStationId(station.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        setSelectedStationId(station.id);
                      }
                    }}
                    sx={{
                      p: { xs: 1.25, md: 1.1 },
                      borderRadius: 2,
                      bgcolor: station.id === selectedStationId
                        ? (darkMode ? "rgba(249, 214, 110, 0.14)" : "#fff3d6")
                        : (darkMode ? "#111827" : "#f8fafc"),
                      cursor: "pointer",
                      border: station.id === selectedStationId
                        ? (darkMode ? "1px solid rgba(249, 214, 110, 0.46)" : "1px solid rgba(184, 115, 51, 0.52)")
                        : `1px solid ${darkMode ? "rgba(148, 163, 184, 0.18)" : "transparent"}`,
                      transition: "transform 120ms ease, box-shadow 120ms ease",
                      boxShadow: station.id === selectedStationId
                        ? (darkMode ? "0 10px 24px rgba(249, 214, 110, 0.16)" : "0 10px 24px rgba(184, 115, 51, 0.12)")
                        : "none",
                      '&:hover': {
                        transform: "translateY(-1px)",
                        boxShadow: darkMode ? "0 10px 20px rgba(2, 6, 23, 0.45)" : "0 10px 20px rgba(15, 23, 42, 0.08)",
                      },
                    }}
                  >
                    <Typography variant="subtitle2">{station.name}</Typography>
                    <Typography variant="caption" sx={{ color: darkMode ? "#94a3b8" : "#475569" }}>
                      {gas ? `Gasoline PHP ${formatPrice(gas.pricePerLiter)}` : "No gasoline report"}
                      {station.distanceKm != null ? ` | ${station.distanceKm.toFixed(2)} km` : ""}
                    </Typography>
                  </Box>
                );
              })}
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};
