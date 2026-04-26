import { Box, Button, Card, CardContent, FormControl, Grid, InputLabel, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import type { Refuel, Station, Vehicle } from "../types";

type EditingRefuelForm = {
  vehicleId: string;
  stationId: string;
  liters: string;
  totalCost: string;
};

type RefuelHistorySectionProps = {
  moduleCardSx: object;
  darkMode: boolean;
  vehicles: Vehicle[];
  stations: Station[];
  refuelForm: {
    vehicleId: string;
    stationId: string;
    liters: string;
    totalCost: string;
  };
  setRefuelForm: React.Dispatch<React.SetStateAction<{
    vehicleId: string;
    stationId: string;
    liters: string;
    totalCost: string;
  }>>;
  addRefuel: () => Promise<void>;
  setError: (message: string) => void;
  refuels: Refuel[];
  editingRefuelId: string | null;
  editingRefuelForm: EditingRefuelForm;
  setEditingRefuelId: (value: string | null) => void;
  setEditingRefuelForm: React.Dispatch<React.SetStateAction<EditingRefuelForm>>;
  updateRefuel: (refuelId: string) => Promise<void>;
  deleteRefuel: (refuelId: string) => Promise<void>;
};

export const RefuelHistorySection = ({
  moduleCardSx,
  darkMode,
  vehicles,
  stations,
  refuelForm,
  setRefuelForm,
  addRefuel,
  setError,
  refuels,
  editingRefuelId,
  editingRefuelForm,
  setEditingRefuelId,
  setEditingRefuelForm,
  updateRefuel,
  deleteRefuel,
}: RefuelHistorySectionProps) => {
  return (
    <Card sx={moduleCardSx}>
      <CardContent sx={{ p: { xs: 1.6, md: 2 } }}>
        <Typography variant="h6" gutterBottom>
          Refuel History
        </Typography>
        <Typography variant="body2" sx={{ color: darkMode ? "#94a3b8" : "#475569", mb: 1.5 }}>
          Keep your refill records organized and monitor fuel spending trends.
        </Typography>
        <Grid container spacing={{ xs: 1, md: 1.5 }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth>
              <InputLabel>Vehicle or Motorcycle</InputLabel>
              <Select label="Vehicle or Motorcycle" value={refuelForm.vehicleId} onChange={(event) => setRefuelForm((prev) => ({ ...prev, vehicleId: event.target.value }))}>
                {vehicles.map((vehicle) => (
                  <MenuItem key={vehicle.id} value={vehicle.id}>{vehicle.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth>
              <InputLabel>Station</InputLabel>
              <Select label="Station" value={refuelForm.stationId} onChange={(event) => setRefuelForm((prev) => ({ ...prev, stationId: event.target.value }))}>
                {stations.map((station) => (
                  <MenuItem key={station.id} value={station.id}>{station.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 2 }}>
            <TextField fullWidth label="Liters" value={refuelForm.liters} onChange={(event) => setRefuelForm((prev) => ({ ...prev, liters: event.target.value }))} />
          </Grid>
          <Grid size={{ xs: 12, md: 2 }}>
            <TextField fullWidth label="Total Cost" value={refuelForm.totalCost} onChange={(event) => setRefuelForm((prev) => ({ ...prev, totalCost: event.target.value }))} />
          </Grid>
        </Grid>
        <Button fullWidth={true} sx={{ mt: 1.5 }} variant="outlined" onClick={() => addRefuel().catch(() => setError("Refuel save failed."))}>
          Save Refuel Record
        </Button>
        <Stack sx={{ mt: 2 }} spacing={1}>
          {refuels.length === 0 ? (
            <Box sx={{ p: 1.4, borderRadius: 2, bgcolor: darkMode ? "#0f172a" : "#f8fafc", border: `1px dashed ${darkMode ? "rgba(148, 163, 184, 0.18)" : "#cbd5e1"}` }}>
              <Typography variant="body2" sx={{ color: darkMode ? "#94a3b8" : "#475569" }}>
                No refuel logs yet. Save your first record to start building your history.
              </Typography>
            </Box>
          ) : (
            refuels.map((entry) => {
              const isEditing = editingRefuelId === entry.id;
              return (
                <Box key={entry.id}>
                  {isEditing ? (
                    <Box sx={{ p: { xs: 1.1, md: 1.25 }, borderRadius: 2, bgcolor: darkMode ? "#111827" : "#eef2ff", border: `2px solid ${darkMode ? "#475569" : "#4338ca"}` }}>
                      <Grid container spacing={1}>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <FormControl fullWidth size="small">
                            <InputLabel>Vehicle</InputLabel>
                            <Select
                              label="Vehicle"
                              value={editingRefuelForm.vehicleId}
                              onChange={(e) => setEditingRefuelForm((prev) => ({ ...prev, vehicleId: e.target.value }))}
                            >
                              {vehicles.map((v) => (
                                <MenuItem key={v.id} value={v.id}>{v.name}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <FormControl fullWidth size="small">
                            <InputLabel>Station</InputLabel>
                            <Select
                              label="Station"
                              value={editingRefuelForm.stationId}
                              onChange={(e) => setEditingRefuelForm((prev) => ({ ...prev, stationId: e.target.value }))}
                            >
                              {stations.map((s) => (
                                <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField fullWidth size="small" label="Liters" type="number" value={editingRefuelForm.liters} onChange={(e) => setEditingRefuelForm((prev) => ({ ...prev, liters: e.target.value }))} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField fullWidth size="small" label="Total Cost" type="number" value={editingRefuelForm.totalCost} onChange={(e) => setEditingRefuelForm((prev) => ({ ...prev, totalCost: e.target.value }))} />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <Stack direction="row" spacing={0.8}>
                            <Button size="small" variant="contained" fullWidth onClick={() => updateRefuel(entry.id).catch(() => setError("Update failed."))}>Save</Button>
                            <Button size="small" variant="outlined" fullWidth onClick={() => setEditingRefuelId(null)}>Cancel</Button>
                          </Stack>
                        </Grid>
                      </Grid>
                    </Box>
                  ) : (
                    <Box sx={{ p: { xs: 1.1, md: 1.25 }, borderRadius: 2, bgcolor: darkMode ? "#111827" : "#fff7ed", border: `1px solid ${darkMode ? "rgba(148, 163, 184, 0.18)" : "#fed7aa"}` }}>
                      <Typography variant="subtitle2">{entry.station.name}</Typography>
                      <Typography variant="caption" sx={{ display: "block", color: "#7c2d12" }}>
                        {entry.vehicle.name} | {entry.liters}L | PHP {Number(entry.totalCost).toFixed(2)}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#9a3412" }}>
                        {new Date(entry.createdAt).toLocaleString()}
                      </Typography>
                      <Stack direction="row" spacing={0.6} sx={{ mt: 1 }}>
                        <Button size="small" variant="outlined" fullWidth onClick={() => {
                          setEditingRefuelId(entry.id);
                          setEditingRefuelForm({ vehicleId: entry.vehicle.id, stationId: entry.station.id, liters: String(entry.liters), totalCost: String(entry.totalCost) });
                        }}>Edit</Button>
                        <Button size="small" variant="outlined" color="error" fullWidth onClick={() => deleteRefuel(entry.id).catch(() => setError("Delete failed."))}>Delete</Button>
                      </Stack>
                    </Box>
                  )}
                </Box>
              );
            })
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};
