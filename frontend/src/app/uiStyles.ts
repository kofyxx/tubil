export const getModuleCardSx = (darkMode: boolean) => ({
  borderRadius: 2,
  border: darkMode ? "1px solid rgba(255, 255, 255, 0.05)" : "1px solid rgba(15, 23, 42, 0.06)",
  boxShadow: darkMode ? "0 24px 58px rgba(0, 0, 0, 0.42)" : "0 20px 40px rgba(30, 41, 59, 0.1)",
  backdropFilter: "blur(22px) saturate(168%)",
  backgroundImage: darkMode
    ? "linear-gradient(180deg, rgba(7, 12, 24, 0.78) 0%, rgba(4, 8, 17, 0.72) 100%)"
    : "linear-gradient(180deg, rgba(255, 252, 247, 0.84) 0%, rgba(247, 241, 232, 0.76) 100%)",
});

export const getAppBarSx = (darkMode: boolean) => ({
  backdropFilter: "blur(24px) saturate(170%)",
  backgroundColor: darkMode ? "rgba(4, 7, 16, 0.58)" : "rgba(255, 250, 242, 0.72)",
  color: darkMode ? "#f7fbff" : "#10212f",
});
