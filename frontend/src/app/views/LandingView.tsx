import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import {
  Box,
  Button,
  Card,
  Chip,
  Container,
  Grid,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type { FormEvent } from "react";

type LandingViewProps = {
  darkMode: boolean;
  authMode: "login" | "register";
  setAuthMode: (mode: "login" | "register") => void;
  displayName: string;
  setDisplayName: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  showPassword: boolean;
  setShowPassword: (value: boolean | ((prev: boolean) => boolean)) => void;
  onSubmitAuth: () => void;
};

export const LandingView = ({
  darkMode,
  authMode,
  setAuthMode,
  displayName,
  setDisplayName,
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  onSubmitAuth,
}: LandingViewProps) => {
  const authInputSx = {
    "& .MuiOutlinedInput-root": {
      bgcolor: darkMode ? "rgba(9, 15, 29, 0.72)" : "rgba(255, 255, 255, 0.72)",
      color: darkMode ? "#f7fbff" : "#10212f",
      backdropFilter: "blur(16px)",
      "& fieldset": { borderColor: darkMode ? "rgba(255, 255, 255, 0.14)" : "rgba(15, 23, 42, 0.1)" },
      "&:hover fieldset": { borderColor: darkMode ? "rgba(249, 214, 110, 0.35)" : "rgba(184, 115, 51, 0.24)" },
      "&.Mui-focused fieldset": { borderColor: darkMode ? "#f9d66e" : "#b87333" },
    },
    "& .MuiOutlinedInput-input": { color: darkMode ? "#f7fbff" : "#10212f" },
    "& .MuiOutlinedInput-input:-webkit-autofill": {
      WebkitTextFillColor: darkMode ? "#f7fbff" : "#10212f",
      WebkitBoxShadow: darkMode
        ? "0 0 0 100px rgba(9, 15, 29, 0.72) inset"
        : "0 0 0 100px rgba(255, 255, 255, 0.72) inset",
      transition: "background-color 9999s ease-in-out 0s",
      caretColor: darkMode ? "#f7fbff" : "#10212f",
    },
    "& .MuiInputLabel-root": { color: darkMode ? "#bac8dd" : "#52606f" },
    "& .MuiInputLabel-root.Mui-focused": { color: darkMode ? "#f9d66e" : "#b87333" },
    "& .MuiFormHelperText-root": { color: darkMode ? "#8ea0bc" : "#5a6977" },
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmitAuth();
  };

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, md: 6 } }}>
      <Grid container spacing={3.5} sx={{ alignItems: "stretch" }}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ borderRadius: { xs: 2.5, md: 5 }, p: { xs: 3, md: 5 }, position: "relative", overflow: "hidden" }}>
            <Box sx={{ position: "absolute", inset: 0, pointerEvents: "none", background: darkMode ? "radial-gradient(circle at 20% 15%, rgba(249, 214, 110, 0.2), transparent 24%), radial-gradient(circle at 78% 10%, rgba(125, 211, 252, 0.14), transparent 22%)" : "radial-gradient(circle at 20% 15%, rgba(249, 214, 110, 0.22), transparent 24%), radial-gradient(circle at 78% 10%, rgba(37, 99, 235, 0.12), transparent 22%)" }} />
            <Stack spacing={2.2} sx={{ position: "relative", zIndex: 1 }}>
              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                <Chip label="Bohol fuel intelligence" sx={{ bgcolor: darkMode ? "rgba(249, 214, 110, 0.16)" : "rgba(184, 115, 51, 0.12)", color: darkMode ? "#fde68a" : "#8f5a22" }} />
                <Chip label="Live station map" sx={{ bgcolor: darkMode ? "rgba(125, 211, 252, 0.12)" : "rgba(37, 99, 235, 0.1)", color: darkMode ? "#bae6fd" : "#1d4ed8" }} />
              </Stack>
              <Box>
                <Typography variant="h2" sx={{ fontWeight: 700, lineHeight: 0.88, letterSpacing: -2.4, textTransform: "uppercase", fontSize: { xs: "3.4rem", md: "6.4rem" }, maxWidth: 820 }}>
                  See the road through the light.
                </Typography>
                <Typography variant="h6" sx={{ mt: 1.6, maxWidth: 620, color: darkMode ? "#c5d2e8" : "#4a5968", fontWeight: 450, lineHeight: 1.66, fontSize: { xs: "0.98rem", md: "1.08rem" } }}>
                  Tubil turns Bohol fuel data into a clear route layer: station locations, verified prices, trip estimates, garage records, and community trust in one place.
                </Typography>
              </Box>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} sx={{ flexWrap: "wrap" }}>
                <Box sx={{ px: 1.5, py: 1.2, borderRadius: 3, minWidth: 150, bgcolor: darkMode ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.62)" }}>
                  <Typography variant="caption" sx={{ color: darkMode ? "#bac8dd" : "#566473", display: "block" }}>Route planning</Typography>
                  <Typography variant="subtitle2">Estimate fuel before you move.</Typography>
                </Box>
                <Box sx={{ px: 1.5, py: 1.2, borderRadius: 3, minWidth: 150, bgcolor: darkMode ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.62)" }}>
                  <Typography variant="caption" sx={{ color: darkMode ? "#bac8dd" : "#566473", display: "block" }}>Community verification</Typography>
                  <Typography variant="subtitle2">Reports sharpen the map.</Typography>
                </Box>
                <Box sx={{ px: 1.5, py: 1.2, borderRadius: 3, minWidth: 150, bgcolor: darkMode ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.62)" }}>
                  <Typography variant="caption" sx={{ color: darkMode ? "#bac8dd" : "#566473", display: "block" }}>Garage memory</Typography>
                  <Typography variant="subtitle2">Keep every unit dialed in.</Typography>
                </Box>
              </Stack>
            </Stack>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ borderRadius: { xs: 2.5, md: 5 }, p: { xs: 2.5, md: 3.5 }, height: "100%", position: "relative", overflow: "hidden", border: darkMode ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(15,23,42,0.08)", background: darkMode ? "rgba(6, 10, 20, 0.5)" : "rgba(255, 252, 247, 0.68)", boxShadow: "none", backdropFilter: "blur(22px) saturate(165%)" }}>
            <Box sx={{ position: "absolute", inset: 0, pointerEvents: "none", background: darkMode ? "radial-gradient(circle at top right, rgba(249, 214, 110, 0.08), transparent 30%), radial-gradient(circle at top left, rgba(125, 211, 252, 0.08), transparent 28%)" : "radial-gradient(circle at top right, rgba(249, 214, 110, 0.12), transparent 30%), radial-gradient(circle at top left, rgba(37, 99, 235, 0.06), transparent 28%)" }} />
            <Stack spacing={2.2} sx={{ position: "relative", zIndex: 1 }}>
              <Box>
                <Typography variant="overline" sx={{ letterSpacing: 1.9, color: darkMode ? "#f9d66e" : "#b87333" }}>Access portal</Typography>
                <Typography variant="h5" sx={{ mt: 0.4, fontWeight: 700, letterSpacing: -0.5 }}>{authMode === "login" ? "Login" : "Create your account"}</Typography>
                <Typography variant="body2" sx={{ mt: 0.6, color: darkMode ? "#bac8dd" : "#546372", lineHeight: 1.68 }}>Save vehicles, track refuels, and verify fuel reports once you are inside the workspace.</Typography>
              </Box>
              <Box component="form" autoComplete="off" onSubmit={handleSubmit}>
                <Stack spacing={1.5}>
                  <Stack direction="row" spacing={1}>
                    <Button fullWidth type="button" variant="outlined" onClick={() => setAuthMode("login")} sx={{ bgcolor: authMode === "login" ? (darkMode ? "rgba(249, 214, 110, 0.14)" : "rgba(184, 115, 51, 0.1)") : "transparent", color: authMode === "login" ? (darkMode ? "#fde68a" : "#8f5a22") : darkMode ? "#bac8dd" : "#516273", borderColor: authMode === "login" ? (darkMode ? "rgba(249, 214, 110, 0.38)" : "rgba(184, 115, 51, 0.3)") : (darkMode ? "rgba(255,255,255,0.12)" : "rgba(15, 23, 42, 0.12)") }}>Login</Button>
                    <Button fullWidth type="button" variant="outlined" onClick={() => setAuthMode("register")} sx={{ bgcolor: authMode === "register" ? (darkMode ? "rgba(249, 214, 110, 0.14)" : "rgba(184, 115, 51, 0.1)") : "transparent", color: authMode === "register" ? (darkMode ? "#fde68a" : "#8f5a22") : darkMode ? "#bac8dd" : "#516273", borderColor: authMode === "register" ? (darkMode ? "rgba(249, 214, 110, 0.38)" : "rgba(184, 115, 51, 0.3)") : (darkMode ? "rgba(255,255,255,0.12)" : "rgba(15, 23, 42, 0.12)") }}>Register</Button>
                  </Stack>
                  {authMode === "register" ? <Typography variant="caption" sx={{ color: darkMode ? "#8ea0bc" : "#58697a" }}>New accounts are always created as user accounts.</Typography> : null}
                  {authMode === "register" ? <TextField label="Display name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} autoComplete="nickname" name="displayName" sx={authInputSx} /> : null}
                  <TextField label="Email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" name="email" sx={authInputSx} />
                  <TextField type={showPassword ? "text" : "password"} label="Password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={authMode === "register" ? "new-password" : "current-password"} name="password" helperText={authMode === "register" ? "Use at least 8 characters." : undefined} sx={authInputSx} slotProps={{ input: { endAdornment: <InputAdornment position="end"><IconButton aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((prev) => !prev)} edge="end" sx={{ color: darkMode ? "#bac8dd" : "#52606f" }}>{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment> } }} />
                  <Button fullWidth type="submit" variant="contained" sx={{ bgcolor: darkMode ? "#f9d66e" : "#b87333", color: darkMode ? "#10212f" : "#ffffff", border: darkMode ? "1px solid rgba(249, 214, 110, 0.4)" : "1px solid rgba(184, 115, 51, 0.8)", boxShadow: "none" }}>{authMode === "register" ? "Create Account" : "Login Account"}</Button>
                </Stack>
              </Box>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};
