import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import type { LeaderboardEntry, AuthUser } from "../types";

type LeaderboardSectionProps = {
  moduleCardSx: object;
  darkMode: boolean;
  leaderboard: LeaderboardEntry[];
  user: AuthUser | null;
};

export const LeaderboardSection = ({ moduleCardSx, darkMode, leaderboard, user }: LeaderboardSectionProps) => {
  return (
    <Card sx={moduleCardSx}>
      <CardContent sx={{ p: { xs: 1.6, md: 2 } }}>
        <Typography variant="h6" gutterBottom>
          Community Leaderboard
        </Typography>
        <Typography variant="body2" sx={{ mb: 1.5, color: darkMode ? "#94a3b8" : "#475569" }}>
          Combined score = points + trust x 100
        </Typography>
        <Stack spacing={1}>
          {leaderboard.length === 0 ? (
            <Box sx={{ p: 1.4, borderRadius: 2, bgcolor: darkMode ? "#0f172a" : "#f8fafc", border: `1px dashed ${darkMode ? "rgba(148, 163, 184, 0.18)" : "#cbd5e1"}` }}>
              <Typography variant="body2" sx={{ color: darkMode ? "#94a3b8" : "#475569" }}>
                Leaderboard is empty right now. Participate in reports and verification to get ranked.
              </Typography>
            </Box>
          ) : (
            leaderboard.map((entry) => (
              <Box
                key={entry.id}
                sx={{
                  p: 1.25,
                  borderRadius: 2,
                  bgcolor: darkMode ? (entry.id === user?.id ? "#1e293b" : "#111827") : (entry.id === user?.id ? "#dbeafe" : "#f8fafc"),
                  border: entry.id === user?.id ? (darkMode ? "1px solid #60a5fa" : "1px solid #1d4ed8") : `1px solid ${darkMode ? "rgba(148, 163, 184, 0.18)" : "#e2e8f0"}`,
                }}
              >
                <Typography variant="subtitle2">#{entry.rank} {entry.displayName}</Typography>
                <Typography variant="caption" sx={{ color: darkMode ? "#94a3b8" : "#475569" }}>
                  Score {entry.combinedScore.toFixed(2)} | Points {entry.points} | Trust {(entry.reliabilityScore * 100).toFixed(0)}%
                </Typography>
              </Box>
            ))
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};
