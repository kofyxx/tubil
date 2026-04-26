import Lightbulb from "@mui/icons-material/Lightbulb";
import LightbulbOutlined from "@mui/icons-material/LightbulbOutlined";

export const renderBulbSwitchGlyph = (on: boolean) =>
  on ? (
    <Lightbulb
      aria-hidden="true"
      sx={{
        width: 22,
        height: 22,
        color: "#facc15",
        filter: "drop-shadow(0 0 6px rgba(250, 204, 21, 0.45))",
      }}
    />
  ) : (
    <LightbulbOutlined
      aria-hidden="true"
      sx={{
        width: 22,
        height: 22,
        color: "#5eead4",
        opacity: 0.95,
      }}
    />
  );
