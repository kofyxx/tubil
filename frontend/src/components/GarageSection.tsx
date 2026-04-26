import { Autocomplete, Box, Button, Card, CardContent, Divider, FormControl, Grid, InputLabel, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import type { FuelType, Vehicle } from "../types";

type UnitPreset = {
  name: string;
  fuelType: FuelType;
  efficiencyKmPerL: number;
  category: "Vehicle" | "Motorcycle";
};

type GarageSectionProps = {
  moduleCardSx: object;
  darkMode: boolean;
  fuelTypes: FuelType[];
  garagePresets: UnitPreset[];
  unitImageMap: Record<string, string>;
  imageFallback: string;
  canManageAdminContent: boolean;
  presetForm: UnitPreset;
  setPresetForm: React.Dispatch<React.SetStateAction<UnitPreset>>;
  editingPresetName: string | null;
  setEditingPresetName: (value: string | null) => void;
  createPreset: () => void;
  updatePreset: () => void;
  deletePreset: (presetName: string) => void;
  addPresetUnit: (preset: UnitPreset) => Promise<void>;
  vehicles: Vehicle[];
  vehicleForm: {
    name: string;
    fuelType: FuelType;
    efficiencyKmPerL: string;
  };
  setVehicleForm: React.Dispatch<React.SetStateAction<{
    name: string;
    fuelType: FuelType;
    efficiencyKmPerL: string;
  }>>;
  addVehicle: () => Promise<void>;
  editingVehicleId: string | null;
  editingVehicleForm: {
    name: string;
    fuelType: FuelType;
    efficiencyKmPerL: string;
  };
  setEditingVehicleId: (value: string | null) => void;
  setEditingVehicleForm: React.Dispatch<React.SetStateAction<{
    name: string;
    fuelType: FuelType;
    efficiencyKmPerL: string;
  }>>;
  updateVehicle: (vehicleId: string) => Promise<void>;
  deleteVehicle: (vehicleId: string) => Promise<void>;
  setError: (message: string) => void;
};

export const GarageSection = ({
  moduleCardSx,
  darkMode,
  fuelTypes,
  garagePresets,
  unitImageMap,
  imageFallback,
  canManageAdminContent,
  presetForm,
  setPresetForm,
  editingPresetName,
  setEditingPresetName,
  createPreset,
  updatePreset,
  deletePreset,
  addPresetUnit,
  vehicles,
  vehicleForm,
  setVehicleForm,
  addVehicle,
  editingVehicleId,
  editingVehicleForm,
  setEditingVehicleId,
  setEditingVehicleForm,
  updateVehicle,
  deleteVehicle,
  setError,
}: GarageSectionProps) => {
  return (
    <Card sx={moduleCardSx}>
      <CardContent sx={{ p: { xs: 1.6, md: 2 } }}>
        <Typography variant="h6" gutterBottom>
          Vehicle and Motorcycle Garage
        </Typography>
        <Typography variant="body2" sx={{ color: darkMode ? "#94a3b8" : "#475569", mb: 1.5 }}>
          Build your garage profile, pick presets, and keep your fleet ready for route planning.
        </Typography>
        <Grid container spacing={{ xs: 1, md: 1.25 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Autocomplete
              freeSolo
              options={garagePresets.map((preset) => preset.name)}
              value={vehicleForm.name}
              onInputChange={(_, value) => {
                setVehicleForm((prev) => ({ ...prev, name: value }));
                const matched = garagePresets.find((preset) => preset.name.toLowerCase() === value.toLowerCase());
                if (matched) {
                  setVehicleForm({
                    name: matched.name,
                    fuelType: matched.fuelType,
                    efficiencyKmPerL: String(matched.efficiencyKmPerL),
                  });
                }
              }}
              renderInput={(params) => <TextField {...params} label="Unit Name" fullWidth />}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Fuel Type</InputLabel>
              <Select label="Fuel Type" value={vehicleForm.fuelType} onChange={(event) => setVehicleForm((prev) => ({ ...prev, fuelType: event.target.value as FuelType }))}>
                {fuelTypes.map((type) => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField fullWidth label="Efficiency km/L" value={vehicleForm.efficiencyKmPerL} onChange={(event) => setVehicleForm((prev) => ({ ...prev, efficiencyKmPerL: event.target.value }))} />
          </Grid>
        </Grid>
        <Button
          fullWidth={true}
          sx={{
            mt: 1.5,
            mb: 2,
            bgcolor: darkMode ? "#f9d66e" : "#b87333",
            color: darkMode ? "#10212f" : "#ffffff",
            borderColor: darkMode ? "rgba(249, 214, 110, 0.62)" : "rgba(184, 115, 51, 0.78)",
            fontWeight: 700,
            "&:hover": { bgcolor: darkMode ? "#f4c95e" : "#9e6324", borderColor: darkMode ? "#f4c95e" : "#9e6324" },
          }}
          variant="contained"
          onClick={() => addVehicle().catch(() => setError("Failed to add unit."))}
        >
          Add Unit
        </Button>

        {canManageAdminContent ? (
          <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: darkMode ? "#0f172a" : "#ecfeff", mb: 2, border: `1px solid ${darkMode ? "rgba(148, 163, 184, 0.18)" : "#67e8f9"}` }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Garage Preset Editor
            </Typography>
            <Grid container spacing={1}>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  label="Preset Name"
                  value={presetForm.name}
                  onChange={(event) => setPresetForm((prev) => ({ ...prev, name: event.target.value }))}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    label="Category"
                    value={presetForm.category}
                    onChange={(event) => setPresetForm((prev) => ({ ...prev, category: event.target.value as UnitPreset["category"] }))}
                  >
                    <MenuItem value="Vehicle">Vehicle</MenuItem>
                    <MenuItem value="Motorcycle">Motorcycle</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Fuel Type</InputLabel>
                  <Select
                    label="Fuel Type"
                    value={presetForm.fuelType}
                    onChange={(event) => setPresetForm((prev) => ({ ...prev, fuelType: event.target.value as FuelType }))}
                  >
                    {fuelTypes.map((type) => (
                      <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 2 }}>
                <TextField
                  fullWidth
                  label="km/L"
                  type="number"
                  value={presetForm.efficiencyKmPerL}
                  onChange={(event) => setPresetForm((prev) => ({ ...prev, efficiencyKmPerL: Number(event.target.value) }))}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 2 }}>
                <Stack direction={{ xs: "row", md: "column" }} spacing={0.6}>
                  <Button
                    fullWidth={true}
                    variant="contained"
                    sx={{
                      bgcolor: darkMode ? "#f9d66e" : "#b87333",
                      color: darkMode ? "#10212f" : "#ffffff",
                      fontWeight: 700,
                      "&:hover": { bgcolor: darkMode ? "#f4c95e" : "#9e6324" },
                    }}
                    onClick={editingPresetName ? updatePreset : createPreset}
                  >
                    {editingPresetName ? "Save" : "Create"}
                  </Button>
                  <Button
                    fullWidth={true}
                    variant="outlined"
                    onClick={() => {
                      setEditingPresetName(null);
                      setPresetForm({ name: "", fuelType: "GASOLINE", efficiencyKmPerL: 10, category: "Vehicle" });
                    }}
                  >
                    Reset
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Box>
        ) : null}

        <Grid container spacing={{ xs: 0.9, md: 1 }}>
          {garagePresets.map((preset) => (
            <Grid key={preset.name} size={{ xs: 12, md: 6 }}>
              <Box sx={{ p: 1.2, borderRadius: 2, bgcolor: darkMode ? "#111827" : "#eef2ff", display: "flex", flexDirection: { xs: "column", sm: "row" }, justifyContent: "space-between", alignItems: { xs: "stretch", sm: "center" }, gap: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.1, minWidth: 0 }}>
                  <Box
                    component="img"
                    src={unitImageMap[preset.name] ?? imageFallback}
                    alt={`${preset.name} reference`}
                    loading="lazy"
                    onError={(event) => {
                      event.currentTarget.src = imageFallback;
                    }}
                    sx={{
                      width: 92,
                      height: 54,
                      borderRadius: 1.5,
                      objectFit: "cover",
                      border: `1px solid ${darkMode ? "rgba(148, 163, 184, 0.18)" : "#cbd5e1"}`,
                      flexShrink: 0,
                    }}
                  />
                  <Box>
                    <Typography variant="caption" sx={{ display: "block" }}>
                      {preset.category} | {preset.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: darkMode ? "#94a3b8" : "#475569" }}>
                      {preset.fuelType} | {preset.efficiencyKmPerL} km/L
                    </Typography>
                  </Box>
                </Box>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={0.6} sx={{ minWidth: { xs: "100%", sm: 180 } }}>
                  <Button
                    size="small"
                    fullWidth={true}
                    variant="contained"
                    sx={{
                      bgcolor: darkMode ? "#f9d66e" : "#b87333",
                      color: darkMode ? "#10212f" : "#ffffff",
                      fontWeight: 700,
                      "&:hover": { bgcolor: darkMode ? "#f4c95e" : "#9e6324" },
                    }}
                    onClick={() => addPresetUnit(preset).catch(() => setError("Failed to add preset unit."))}
                  >
                    Add
                  </Button>
                  {canManageAdminContent ? (
                    <>
                      <Button
                        size="small"
                        fullWidth={true}
                        variant="outlined"
                        sx={{
                          color: darkMode ? "#fde68a" : "#8f5a22",
                          borderColor: darkMode ? "rgba(249, 214, 110, 0.38)" : "rgba(184, 115, 51, 0.34)",
                          "&:hover": {
                            borderColor: darkMode ? "rgba(249, 214, 110, 0.56)" : "rgba(184, 115, 51, 0.46)",
                            bgcolor: darkMode ? "rgba(249, 214, 110, 0.1)" : "rgba(184, 115, 51, 0.08)",
                          },
                        }}
                        onClick={() => {
                          setEditingPresetName(preset.name);
                          setPresetForm(preset);
                        }}
                      >
                        Edit
                      </Button>
                      <Button size="small" fullWidth={true} color="error" variant="outlined" onClick={() => deletePreset(preset.name)}>
                        Delete
                      </Button>
                    </>
                  ) : null}
                </Stack>
              </Box>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 2 }} />
        <Grid container spacing={1}>
          {vehicles.length === 0 ? (
            <Grid size={{ xs: 12 }}>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: darkMode ? "#0f172a" : "#f8fafc", border: `1px dashed ${darkMode ? "rgba(148, 163, 184, 0.18)" : "#cbd5e1"}` }}>
                <Typography variant="body2" sx={{ color: darkMode ? "#94a3b8" : "#475569" }}>
                  No units in garage yet. Add a preset or create your own unit profile.
                </Typography>
              </Box>
            </Grid>
          ) : (
            vehicles.map((vehicle) => {
              const isEditing = editingVehicleId === vehicle.id;
              return (
                <Grid key={vehicle.id} size={{ xs: 12, md: 4 }}>
                  {isEditing ? (
                    <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: darkMode ? "#111827" : "#eef2ff", border: `2px solid ${darkMode ? "#475569" : "#4338ca"}` }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Name"
                        value={editingVehicleForm.name}
                        onChange={(e) => setEditingVehicleForm((prev) => ({ ...prev, name: e.target.value }))}
                        sx={{ mb: 1 }}
                      />
                      <FormControl fullWidth sx={{ mb: 1 }}>
                        <InputLabel>Fuel Type</InputLabel>
                        <Select
                          label="Fuel Type"
                          value={editingVehicleForm.fuelType}
                          onChange={(e) => setEditingVehicleForm((prev) => ({ ...prev, fuelType: e.target.value as FuelType }))}
                          size="small"
                        >
                          {fuelTypes.map((type) => (
                            <MenuItem key={type} value={type}>{type}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <TextField
                        fullWidth
                        size="small"
                        label="Efficiency km/L"
                        value={editingVehicleForm.efficiencyKmPerL}
                        onChange={(e) => setEditingVehicleForm((prev) => ({ ...prev, efficiencyKmPerL: e.target.value }))}
                        sx={{ mb: 1 }}
                      />
                      <Stack direction="row" spacing={0.8}>
                        <Button
                          size="small"
                          variant="contained"
                          fullWidth
                          sx={{
                            bgcolor: darkMode ? "#f9d66e" : "#b87333",
                            color: darkMode ? "#10212f" : "#ffffff",
                            fontWeight: 700,
                            "&:hover": { bgcolor: darkMode ? "#f4c95e" : "#9e6324" },
                          }}
                          onClick={() => updateVehicle(vehicle.id).catch(() => setError("Update failed."))}
                        >
                          Save
                        </Button>
                        <Button size="small" variant="outlined" fullWidth onClick={() => setEditingVehicleId(null)}>Cancel</Button>
                      </Stack>
                    </Box>
                  ) : (
                    <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: darkMode ? "#111827" : "#f8fafc", border: `1px solid ${darkMode ? "rgba(148, 163, 184, 0.18)" : "#e2e8f0"}` }}>
                      <Box
                        component="img"
                        src={unitImageMap[vehicle.name] ?? imageFallback}
                        alt={`${vehicle.name} reference`}
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.src = imageFallback;
                        }}
                        sx={{
                          width: "100%",
                          height: 132,
                          borderRadius: 1.6,
                          objectFit: "cover",
                          border: `1px solid ${darkMode ? "rgba(148, 163, 184, 0.18)" : "#e2e8f0"}`,
                          mb: 1,
                        }}
                      />
                      <Typography variant="subtitle2">{vehicle.name}</Typography>
                      <Typography variant="caption">{vehicle.fuelType} | {vehicle.efficiencyKmPerL} km/L</Typography>
                      <Stack direction="row" spacing={0.6} sx={{ mt: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          fullWidth
                          sx={{
                            color: darkMode ? "#fde68a" : "#8f5a22",
                            borderColor: darkMode ? "rgba(249, 214, 110, 0.38)" : "rgba(184, 115, 51, 0.34)",
                            "&:hover": {
                              borderColor: darkMode ? "rgba(249, 214, 110, 0.56)" : "rgba(184, 115, 51, 0.46)",
                              bgcolor: darkMode ? "rgba(249, 214, 110, 0.1)" : "rgba(184, 115, 51, 0.08)",
                            },
                          }}
                          onClick={() => {
                            setEditingVehicleId(vehicle.id);
                            setEditingVehicleForm({ name: vehicle.name, fuelType: vehicle.fuelType, efficiencyKmPerL: String(vehicle.efficiencyKmPerL) });
                          }}
                        >
                          Edit
                        </Button>
                        <Button size="small" variant="outlined" color="error" fullWidth onClick={() => deleteVehicle(vehicle.id).catch(() => setError("Delete failed."))}>Delete</Button>
                      </Stack>
                    </Box>
                  )}
                </Grid>
              );
            })
          )}
        </Grid>
      </CardContent>
    </Card>
  );
};
