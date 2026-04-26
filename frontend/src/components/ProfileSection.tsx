import { Box, Button, Card, CardContent, Grid, Stack, Typography } from "@mui/material";
import type { AuthUser, Refuel, Trip, Vehicle } from "../types";

type ProfileSectionProps = {
  moduleCardSx: object;
  darkMode: boolean;
  user: AuthUser | null;
  profilePhotoDataUrl: string;
  openProfilePhotoPreview: () => void;
  openProfilePhotoPicker: () => void;
  removeProfilePhoto: () => void;
  vehicles: Vehicle[];
  trips: Trip[];
  refuels: Refuel[];
  currentLocationName: string;
  locationAccuracyM: number | null;
};

export const ProfileSection = ({
  moduleCardSx,
  darkMode,
  user,
  profilePhotoDataUrl,
  openProfilePhotoPreview,
  openProfilePhotoPicker,
  removeProfilePhoto,
  vehicles,
  trips,
  refuels,
  currentLocationName,
  locationAccuracyM,
}: ProfileSectionProps) => {
  return (
    <Card sx={moduleCardSx}>
      <CardContent sx={{ p: { xs: 1.6, md: 2 } }}>
        <Typography variant="h6" gutterBottom>
          User Profile
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: darkMode ? "#111827" : "#f8fafc", border: `1px solid ${darkMode ? "rgba(148, 163, 184, 0.18)" : "#dbeafe"}`, display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
              <Box
                component="img"
                src={profilePhotoDataUrl || "https://placehold.co/160x160/e2e8f0/334155?text=Profile"}
                alt="User profile"
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
                  width: 96,
                  height: 96,
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "2px solid #bfdbfe",
                  flexShrink: 0,
                  cursor: "pointer",
                }}
              />
              <Box sx={{ flex: 1, minWidth: 220 }}>
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                  Profile Picture
                </Typography>
                <Typography variant="caption" sx={{ color: darkMode ? "#94a3b8" : "#475569", display: "block", mb: 1 }}>
                  Upload JPG, PNG, WEBP, or GIF. Photos are auto-resized to max 512px for faster save; GIF max is 4MB.
                </Typography>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ flexWrap: "wrap" }}>
                  <Button variant="outlined" onClick={openProfilePhotoPicker}>
                    Upload Photo or GIF
                  </Button>
                  <Button variant="text" color="error" disabled={!profilePhotoDataUrl} onClick={removeProfilePhoto}>
                    Remove
                  </Button>
                </Stack>
              </Box>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: darkMode ? "#111827" : "#f8fafc" }}>
              <Typography variant="subtitle2">Display Name</Typography>
              <Typography variant="body2">{user?.displayName ?? "-"}</Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: darkMode ? "#111827" : "#f8fafc" }}>
              <Typography variant="subtitle2">Email</Typography>
              <Typography variant="body2">{user?.email ?? "-"}</Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: darkMode ? "#111827" : "#f8fafc" }}>
              <Typography variant="subtitle2">Account Type</Typography>
              <Typography variant="body2">
                {user?.isAdmin ? "Admin" : "Normal User"}
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: darkMode ? "#111827" : "#f8fafc" }}>
              <Typography variant="subtitle2">Points</Typography>
              <Typography variant="body2">{user?.points ?? 0}</Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: darkMode ? "#111827" : "#f8fafc" }}>
              <Typography variant="subtitle2">Trust Score</Typography>
              <Typography variant="body2">{(((user?.reliabilityScore ?? 0) * 100).toFixed(0))}%</Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: darkMode ? "#111827" : "#fff7ed" }}>
              <Typography variant="subtitle2">Garage Units</Typography>
              <Typography variant="body2">{vehicles.length}</Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: darkMode ? "#111827" : "#fff7ed" }}>
              <Typography variant="subtitle2">Trip Logs</Typography>
              <Typography variant="body2">{trips.length}</Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: darkMode ? "#111827" : "#fff7ed" }}>
              <Typography variant="subtitle2">Refuel Logs</Typography>
              <Typography variant="body2">{refuels.length}</Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: darkMode ? "#111827" : "#eef2ff" }}>
              <Typography variant="subtitle2">Current Location</Typography>
              <Typography variant="body2">{currentLocationName}</Typography>
              <Typography variant="caption" sx={{ color: darkMode ? "#94a3b8" : "#475569", display: "block", mt: 0.4 }}>
                {locationAccuracyM != null ? `GPS accuracy: ~${Math.round(locationAccuracyM)}m` : "GPS accuracy unavailable"}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
