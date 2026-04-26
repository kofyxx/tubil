import { Box, Button, Card, CardContent, Divider, FormControl, Grid, InputLabel, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import type { FuelPrice, FuelType, Station } from "../types";

type VerifySectionProps = {
  moduleCardSx: object;
  darkMode: boolean;
  selectedStationId: string;
  setSelectedStationId: (stationId: string) => void;
  syncRefuelStation: (stationId: string) => void;
  stations: Station[];
  fuelTypes: FuelType[];
  priceFuelType: FuelType;
  setPriceFuelType: (fuelType: FuelType) => void;
  priceValue: string;
  setPriceValue: (value: string) => void;
  submitPrice: () => Promise<void>;
  setError: (message: string) => void;
  selectedStationPrices: FuelPrice[];
  votingPriceId: string;
  votePrice: (priceId: string, isAccurate: boolean) => Promise<void>;
  formatPrice: (value: string | number) => string;
};

export const VerifySection = ({
  moduleCardSx,
  darkMode,
  selectedStationId,
  setSelectedStationId,
  syncRefuelStation,
  stations,
  fuelTypes,
  priceFuelType,
  setPriceFuelType,
  priceValue,
  setPriceValue,
  submitPrice,
  setError,
  selectedStationPrices,
  votingPriceId,
  votePrice,
  formatPrice,
}: VerifySectionProps) => {
  return (
    <Card sx={moduleCardSx}>
      <CardContent sx={{ p: { xs: 1.6, md: 2 } }}>
        <Typography variant="h6" gutterBottom>
          Verify Price Reports
        </Typography>
        <Typography variant="body2" sx={{ mb: 1.5, color: darkMode ? "#c5d2e8" : "#475569" }}>
          Review recent station reports and vote to keep price intelligence accurate.
        </Typography>
        <Grid container spacing={{ xs: 1, md: 1.5 }}>
          <Grid size={{ xs: 12, md: 5 }}>
            <FormControl fullWidth>
              <InputLabel>Station</InputLabel>
              <Select
                value={selectedStationId}
                label="Station"
                onChange={(event) => {
                  const stationId = event.target.value;
                  setSelectedStationId(stationId);
                  syncRefuelStation(stationId);
                }}
              >
                {stations.map((station) => (
                  <MenuItem key={station.id} value={station.id}>{station.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Fuel Type</InputLabel>
              <Select value={priceFuelType} label="Fuel Type" onChange={(event) => setPriceFuelType(event.target.value as FuelType)}>
                {fuelTypes.map((type) => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 2 }}>
            <TextField fullWidth label="Price/L" value={priceValue} onChange={(event) => setPriceValue(event.target.value)} />
          </Grid>
          <Grid size={{ xs: 12, md: 2 }}>
            <Button
              fullWidth
              sx={{
                height: { xs: "auto", md: "100%" },
                bgcolor: darkMode ? "#f9d66e" : "#b87333",
                color: darkMode ? "#10212f" : "#ffffff",
                border: darkMode ? "1px solid rgba(249, 214, 110, 0.5)" : "1px solid rgba(184, 115, 51, 0.72)",
                fontWeight: 700,
                "&:hover": { bgcolor: darkMode ? "#f4c95e" : "#9e6324", borderColor: darkMode ? "#f4c95e" : "#9e6324" },
              }}
              variant="contained"
              onClick={() => submitPrice().catch(() => setError("Failed to submit price."))}
            >
              Submit
            </Button>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Stack spacing={1}>
          {selectedStationPrices.length === 0 ? (
            <Typography variant="body2">No reports yet for this station.</Typography>
          ) : (
            selectedStationPrices.map((price) => (
              <Box
                key={price.id}
                sx={{
                  p: 1.25,
                  borderRadius: 2,
                  bgcolor: darkMode ? "rgba(8, 16, 33, 0.92)" : "#f8fafc",
                  border: `1px solid ${darkMode ? "rgba(226, 232, 240, 0.22)" : "#cbd5e1"}`,
                  boxShadow: darkMode ? "0 10px 24px rgba(0, 0, 0, 0.26)" : "none",
                }}
              >
                <Typography variant="subtitle2" sx={{ color: darkMode ? "#f3f7ff" : "#0f172a", fontWeight: 700 }}>
                  {price.fuelType} | PHP {formatPrice(price.pricePerLiter)}
                </Typography>
                <Typography variant="caption" sx={{ display: "block", color: darkMode ? "#c5d2e8" : "#475569", mb: 1 }}>
                  Score: {price.verificationScore} | {price.isVerified ? "Verified" : "Pending"}
                  {price.user ? ` | by ${price.user.displayName}` : ""}
                </Typography>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                  <Button
                    size="small"
                    variant="contained"
                    sx={{
                      bgcolor: darkMode ? "#f9d66e" : "#b87333",
                      color: darkMode ? "#10212f" : "#ffffff",
                      fontWeight: 700,
                      "&:hover": { bgcolor: darkMode ? "#f4c95e" : "#9e6324" },
                    }}
                    disabled={votingPriceId === price.id}
                    onClick={() => votePrice(price.id, true).catch(() => setError("Vote failed."))}
                  >
                    Accurate
                  </Button>
                  <Button size="small" variant="outlined" color="error" disabled={votingPriceId === price.id} onClick={() => votePrice(price.id, false).catch(() => setError("Vote failed."))}>
                    Inaccurate
                  </Button>
                </Stack>
              </Box>
            ))
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};
