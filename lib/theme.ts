import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#1565C0",
      light: "#1E88E5",
      dark: "#0D47A1",
      contrastText: "#fff",
    },
    secondary: {
      main: "#FF6F00",
      light: "#FFA000",
      dark: "#E65100",
    },
    background: {
      default: "#F5F7FA",
    },
  },
  typography: {
    fontFamily: `"Sarabun", "Roboto", "Helvetica", "Arial", sans-serif`,
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          "& .MuiTableCell-head": {
            backgroundColor: "#1565C0",
            color: "#fff",
            fontWeight: 600,
          },
        },
      },
    },
  },
});
