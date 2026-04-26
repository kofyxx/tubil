import { Box } from "@mui/material";
import { createTheme } from "@mui/material/styles";

export const createAppTheme = (darkMode: boolean) =>
  createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      primary: {
        main: darkMode ? "#f9d66e" : "#b87333",
        dark: darkMode ? "#f4b860" : "#8f5a22",
        light: darkMode ? "#fde68a" : "#e2a45a",
        contrastText: "#ffffff",
      },
      secondary: {
        main: darkMode ? "#7dd3fc" : "#2563eb",
        dark: darkMode ? "#38bdf8" : "#1d4ed8",
        light: darkMode ? "#bae6fd" : "#60a5fa",
      },
      success: {
        main: darkMode ? "#86efac" : "#16a34a",
      },
      background: {
        default: darkMode ? "#030712" : "#f6f0e8",
        paper: darkMode ? "rgba(10, 17, 33, 0.78)" : "rgba(255, 252, 247, 0.82)",
      },
      text: {
        primary: darkMode ? "#f7fbff" : "#10212f",
        secondary: darkMode ? "#bac8dd" : "#445569",
      },
    },
    shape: {
      borderRadius: 20,
    },
    typography: {
      fontFamily: "Manrope, sans-serif",
      h1: { fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, letterSpacing: -1.8, lineHeight: 0.92 },
      h2: { fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, letterSpacing: -1.4, lineHeight: 0.94 },
      h3: { fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, letterSpacing: -1.1, lineHeight: 0.98 },
      h4: { fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, letterSpacing: -0.8, lineHeight: 1.02 },
      h5: { fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, letterSpacing: -0.5, lineHeight: 1.06 },
      h6: { fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, letterSpacing: -0.3, lineHeight: 1.1 },
      button: {
        textTransform: "none",
        fontWeight: 650,
        letterSpacing: 0.1,
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          html: {
            background: darkMode
              ? "radial-gradient(circle at 14% 14%, rgba(249, 214, 110, 0.12), transparent 30%), radial-gradient(circle at 84% 18%, rgba(125, 211, 252, 0.1), transparent 28%), linear-gradient(180deg, #060b16 0%, #02050b 100%)"
              : "radial-gradient(circle at 14% 14%, rgba(248, 200, 76, 0.16), transparent 30%), radial-gradient(circle at 84% 18%, rgba(37, 99, 235, 0.08), transparent 28%), linear-gradient(180deg, #f8f1e8 0%, #eef1ef 100%)",
          },
          body: {
            background: darkMode
              ? "radial-gradient(circle at 14% 14%, rgba(249, 214, 110, 0.12), transparent 30%), radial-gradient(circle at 84% 18%, rgba(125, 211, 252, 0.1), transparent 28%), linear-gradient(180deg, #060b16 0%, #02050b 100%)"
              : "radial-gradient(circle at 14% 14%, rgba(248, 200, 76, 0.16), transparent 30%), radial-gradient(circle at 84% 18%, rgba(37, 99, 235, 0.08), transparent 28%), linear-gradient(180deg, #f8f1e8 0%, #eef1ef 100%)",
            color: darkMode ? "#f7fbff" : "#10212f",
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 24,
            border: darkMode ? "1px solid rgba(255, 255, 255, 0.05)" : "1px solid rgba(15, 23, 42, 0.06)",
            boxShadow: darkMode ? "0 24px 64px rgba(0, 0, 0, 0.44)" : "0 22px 46px rgba(30, 41, 59, 0.1)",
            backdropFilter: "blur(20px) saturate(172%)",
            backgroundColor: darkMode ? "rgba(6, 10, 20, 0.62)" : "rgba(255, 252, 247, 0.74)",
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: darkMode
              ? "linear-gradient(90deg, rgba(4, 7, 16, 0.74) 0%, rgba(9, 16, 31, 0.66) 54%, rgba(14, 23, 42, 0.72) 100%)"
              : "linear-gradient(90deg, rgba(255, 250, 242, 0.86) 0%, rgba(249, 244, 235, 0.76) 54%, rgba(242, 236, 225, 0.82) 100%)",
            boxShadow: darkMode ? "0 14px 40px rgba(0, 0, 0, 0.34)" : "0 14px 34px rgba(30, 41, 59, 0.1)",
            borderBottom: darkMode ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(15, 23, 42, 0.06)",
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 999,
            paddingInline: 15,
            paddingBlock: 9,
          },
          contained: {
            boxShadow: darkMode ? "0 14px 34px rgba(249, 214, 110, 0.22)" : "0 12px 28px rgba(184, 115, 51, 0.15)",
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 999,
            fontWeight: 560,
            letterSpacing: 0.02,
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          size: "small",
        },
      },
    },
  });

export const renderAmbientBackground = () => (
  <Box className="tubil-ambient" aria-hidden="true" id="tubil-ambient-host">
    <Box className="tubil-ray tubil-ray--one" id="ray-one" />
    <Box className="tubil-ray tubil-ray--two" id="ray-two" />
    <Box className="tubil-ray tubil-ray--three" id="ray-three" />
    <Box className="tubil-orb tubil-orb--one" id="orb-one" />
    <Box className="tubil-orb tubil-orb--two" id="orb-two" />
    <Box className="tubil-noise" />
  </Box>
);
