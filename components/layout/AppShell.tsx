"use client";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Navbar from "./Navbar";

interface AppShellProps {
  children: React.ReactNode;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl" | false;
  noPadding?: boolean;
}

export default function AppShell({
  children,
  maxWidth = "xl",
  noPadding = false,
}: AppShellProps) {
  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <Box component="main" sx={{ flexGrow: 1 }}>
        {noPadding ? (
          children
        ) : (
          <Container maxWidth={maxWidth} sx={{ py: 3 }}>
            {children}
          </Container>
        )}
      </Box>
      <Box
        component="footer"
        sx={{
          py: 2,
          textAlign: "center",
          fontSize: 12,
          color: "text.secondary",
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        © {new Date().getFullYear()} NBA Tech Engineer. All rights reserved.
      </Box>
    </Box>
  );
}
