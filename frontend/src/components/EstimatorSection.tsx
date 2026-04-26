import { Autocomplete, Box, Button, Card, CardContent, Grid, Stack, TextField, Typography } from "@mui/material";
import type React from "react";
import type { Trip, Vehicle } from "../types";

type RouteEstimate = {
  distanceKm: number;
  durationMin: number;
};

type TripForm = {
  vehicleId: string;
  origin: string;
  destination: string;
  distanceKm: string;
  fuelPricePerLiter: string;
};

type EstimatorSectionProps = {
  moduleCardSx: object;
  darkMode: boolean;
  routingBusy: boolean;
  routeEstimate: RouteEstimate | null;
  tripForm: TripForm;
  reverseGeocodingBusy: boolean;
  estimatorMapHostRef: React.RefObject<HTMLDivElement | null>;
  setTripForm: React.Dispatch<React.SetStateAction<TripForm>>;
  vehicles: Vehicle[];
  estimateTrip: () => Promise<void>;
  setError: (message: string) => void;
  trips: Trip[];
  formatCost: (value: string | number) => string;
};

const getEstimatorPalette = (darkMode: boolean) => ({
  accent: darkMode ? "#7dd3fc" : "#2563eb",
  accentSoftBg: darkMode ? "rgba(125, 211, 252, 0.10)" : "rgba(37, 99, 235, 0.08)",
  accentText: darkMode ? "#bae6fd" : "#1d4ed8",
  primary: darkMode ? "#f9d66e" : "#b87333",
  primarySoftBg: darkMode ? "rgba(249, 214, 110, 0.10)" : "rgba(184, 115, 51, 0.08)",
  primaryText: darkMode ? "#fde68a" : "#8f5a22",
  panelBg: darkMode ? "#07101e" : "#f8f4ee",
  panelBgSoft: darkMode ? "#0b1220" : "#eef3f1",
  success: darkMode ? "#86efac" : "#16a34a",
  successStrong: darkMode ? "#34d399" : "#15803d",
  text: darkMode ? "#f7fbff" : "#10212f",
  textMuted: darkMode ? "#bac8dd" : "#445569",
  textSoft: darkMode ? "#94a3b8" : "#475569",
  border: darkMode ? "rgba(148, 163, 184, 0.18)" : "rgba(37, 99, 235, 0.16)",
  borderSoft: darkMode ? "rgba(125, 211, 252, 0.18)" : "rgba(37, 99, 235, 0.14)",
});

export const EstimatorSection = ({
  moduleCardSx,
  darkMode,
  routingBusy,
  routeEstimate,
  tripForm,
  reverseGeocodingBusy,
  estimatorMapHostRef,
  setTripForm,
  vehicles,
  estimateTrip,
  setError,
  trips,
  formatCost,
}: EstimatorSectionProps) => {
  const palette = getEstimatorPalette(darkMode);

  return (
    <Card sx={moduleCardSx}>
      <CardContent sx={{ p: { xs: 1.6, md: 2 } }}>
        <Box sx={{ mb: 1.5, pb: 1.25, borderBottom: "1px dashed rgba(148, 163, 184, 0.45)" }}>
          <Typography variant="overline" sx={{ letterSpacing: 1.3, color: palette.accent }}>
            Route Intelligence
          </Typography>
          <Typography variant="h6" gutterBottom>
            Trip Cost Estimator
          </Typography>
          <Typography variant="body2" sx={{ color: palette.textMuted }}>
            Estimate cost from your current location to any destination pin you choose on the map.
          </Typography>
        </Box>
        <Box sx={{ mb: 1.5, p: { xs: 1, md: 1.2 }, borderRadius: 2, bgcolor: palette.accentSoftBg }}>
          <Typography variant="caption" sx={{ color: palette.accentText, display: "block" }}>
            {routingBusy
              ? "Calculating road route..."
              : routeEstimate
                ? `Current Location -> ${tripForm.destination || "Selected destination"}: ${routeEstimate.distanceKm.toFixed(2)} km | ETA: ${Math.round(routeEstimate.durationMin)} min`
                : "No route result yet."}
          </Typography>
          {reverseGeocodingBusy ? (
            <Typography variant="caption" sx={{ color: palette.textSoft, display: "block", mt: 0.5 }}>
              Resolving destination place name...
            </Typography>
          ) : null}
        </Box>
        <Card variant="outlined" sx={{ borderRadius: 1, mb: 1.5, overflow: "hidden", borderColor: palette.border }}>
          <Box sx={{ p: 1, bgcolor: palette.primarySoftBg, borderBottom: `1px solid ${palette.borderSoft}` }}>
            <Typography variant="caption" sx={{ color: palette.primaryText, fontWeight: 600, display: "block" }}>
              Destination picker map
            </Typography>
            <Typography variant="caption" sx={{ color: palette.primaryText }}>
              Tap any point on the map to set your destination.
            </Typography>
          </Box>
          <Box ref={estimatorMapHostRef} sx={{ height: { xs: 220, md: 320 } }} />
        </Card>
        <Grid container spacing={{ xs: 1, md: 1.5 }}>
          <Grid size={{ xs: 12 }}>
            <TextField fullWidth label="Destination" value={tripForm.destination} onChange={(event) => setTripForm((prev) => ({ ...prev, destination: event.target.value }))} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField fullWidth label="Distance km" value={tripForm.distanceKm} onChange={(event) => setTripForm((prev) => ({ ...prev, distanceKm: event.target.value }))} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField fullWidth label="Fuel Price/L" value={tripForm.fuelPricePerLiter} onChange={(event) => setTripForm((prev) => ({ ...prev, fuelPricePerLiter: event.target.value }))} />
          </Grid>
          <Grid size={{ xs: 12, md: 8 }}>
            <Autocomplete
              options={vehicles}
              value={vehicles.find((vehicle) => vehicle.id === tripForm.vehicleId) ?? null}
              getOptionLabel={(option) => option.name}
              onChange={(_event, value) => setTripForm((prev) => ({ ...prev, vehicleId: value?.id ?? "" }))}
              renderInput={(params) => <TextField {...params} label="Vehicle or Motorcycle (type to search)" fullWidth />}
            />
          </Grid>
        </Grid>
        {tripForm.vehicleId && (
          <Box
            sx={{
              mt: 2,
              p: { xs: 1.2, md: 2 },
              borderRadius: 2,
              bgcolor: palette.panelBg,
              border: `1px solid ${palette.borderSoft}`,
            }}
          >
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" sx={{ color: palette.success, display: "block", fontWeight: 600 }}>
                  Cost Breakdown
                </Typography>
                <Typography variant="caption" sx={{ color: palette.accentText }}>
                  {vehicles.find((v) => v.id === tripForm.vehicleId)?.name || "Vehicle"}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                  <Typography variant="caption" sx={{ color: palette.textMuted }}>Distance:</Typography>
                  <Typography variant="caption" sx={{ color: palette.text, fontWeight: 600 }}>{Number(tripForm.distanceKm).toFixed(2)} km</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                  <Typography variant="caption" sx={{ color: palette.textMuted }}>Efficiency:</Typography>
                  <Typography variant="caption" sx={{ color: palette.text, fontWeight: 600 }}>{(vehicles.find((v) => v.id === tripForm.vehicleId)?.efficiencyKmPerL || 0).toFixed(1)} km/L</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                  <Typography variant="caption" sx={{ color: palette.textMuted }}>Fuel needed:</Typography>
                  <Typography variant="caption" sx={{ color: palette.text, fontWeight: 600 }}>{(Number(tripForm.distanceKm) / (vehicles.find((v) => v.id === tripForm.vehicleId)?.efficiencyKmPerL || 1)).toFixed(2)} L</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                  <Typography variant="caption" sx={{ color: palette.textMuted }}>Price/L:</Typography>
                  <Typography variant="caption" sx={{ color: palette.text, fontWeight: 600 }}>PHP {Number(tripForm.fuelPricePerLiter).toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", pt: 1, borderTop: `1px solid ${palette.borderSoft}` }}>
                  <Typography variant="subtitle2" sx={{ color: palette.accentText, fontWeight: 700 }}>Estimated Cost:</Typography>
                  <Typography variant="subtitle2" sx={{ color: palette.successStrong, fontWeight: 700, fontSize: { xs: "1rem", md: "1.1rem" } }}>
                    PHP {((Number(tripForm.distanceKm) / (vehicles.find((v) => v.id === tripForm.vehicleId)?.efficiencyKmPerL || 1)) * Number(tripForm.fuelPricePerLiter)).toFixed(2)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}
        <Button
          fullWidth={true}
          sx={{
            mt: 1.5,
            bgcolor: palette.primary,
            color: darkMode ? "#111827" : "#ffffff",
            "&:hover": { bgcolor: darkMode ? "#eab308" : "#8f5a22" },
          }}
          variant="contained"
          onClick={() => estimateTrip().catch(() => setError("Trip estimate failed."))}
        >
          Estimate and Save
        </Button>
        <Stack sx={{ mt: 2 }} spacing={1}>
          {trips.length === 0 ? (
            <Box sx={{ p: 1.4, borderRadius: 2, bgcolor: palette.panelBgSoft, border: `1px dashed ${palette.border}` }}>
              <Typography variant="body2" sx={{ color: palette.textMuted }}>
                No saved trip yet. Add a destination and save your first estimate.
              </Typography>
            </Box>
          ) : (
            trips.map((trip) => (
              <Box key={trip.id} sx={{ p: { xs: 1.1, md: 1.25 }, borderRadius: 2, bgcolor: palette.panelBgSoft, border: `1px solid ${palette.border}` }}>
                <Typography variant="subtitle2" sx={{ color: palette.text }}>{trip.origin} to {trip.destination}</Typography>
                <Typography variant="caption" sx={{ color: palette.textMuted }}>
                  {trip.distanceKm} km
                  {trip.durationMin != null ? ` | ${Math.round(trip.durationMin)} min` : ""}
                  {` | PHP ${formatCost(trip.estimatedCost)}`}
                </Typography>
              </Box>
            ))
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};
