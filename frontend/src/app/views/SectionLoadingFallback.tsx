import { Box, Card, CardContent, CircularProgress, Skeleton, Stack } from "@mui/material";

type SectionLoadingFallbackProps = {
  darkMode: boolean;
};

export const SectionLoadingFallback = ({ darkMode }: SectionLoadingFallbackProps) => (
  <Card sx={{ borderRadius: 4, overflow: "hidden", border: `1px solid ${darkMode ? "rgba(148, 163, 184, 0.22)" : "rgba(148, 163, 184, 0.28)"}` }}>
    <Box sx={{ p: { xs: 2, md: 2.5 }, bgcolor: darkMode ? "#111827" : "#0f172a", color: "white" }}>
      <Stack direction="row" spacing={1.2} sx={{ alignItems: "center" }}>
        <CircularProgress size={22} sx={{ color: "white" }} />
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" width="40%" height={28} sx={{ bgcolor: "rgba(255,255,255,0.18)" }} />
          <Skeleton variant="text" width="70%" height={18} sx={{ bgcolor: "rgba(255,255,255,0.12)" }} />
        </Box>
      </Stack>
    </Box>
    <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
      <Stack spacing={1.2}>
        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
          <Skeleton variant="rounded" width={108} height={32} />
          <Skeleton variant="rounded" width={108} height={32} />
          <Skeleton variant="rounded" width={108} height={32} />
        </Stack>
        <Skeleton variant="rounded" height={240} sx={{ borderRadius: 3 }} />
        <Skeleton variant="text" width="55%" height={24} />
        <Skeleton variant="text" width="85%" />
        <Skeleton variant="text" width="72%" />
      </Stack>
    </CardContent>
  </Card>
);
