import { Button, Card, CardContent, Stack, Typography } from "@mui/material";

type AdminSectionProps = {
  darkMode: boolean;
  importingStations: boolean;
  importStations: () => Promise<void>;
  setError: (message: string) => void;
};

export const AdminSection = ({ darkMode, importingStations, importStations, setError }: AdminSectionProps) => {
  return (
    <Card sx={{ borderRadius: 2, border: "1px solid #1d4ed8" }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Admin Center
        </Typography>
        <Typography variant="body2" sx={{ color: darkMode ? "#94a3b8" : "#475569", mb: 1.5 }}>
          You are using an admin account. Use this panel for admin-only actions.
        </Typography>
        <Stack spacing={1.25}>
          <Button variant="contained" disabled={importingStations} onClick={() => importStations().catch(() => setError("Station import failed."))}>
            {importingStations ? "Importing stations..." : "Import or Refresh Stations from OSM"}
          </Button>
          <Typography variant="caption" sx={{ color: "#64748b" }}>
          
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
};
