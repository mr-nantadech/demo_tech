import { Suspense } from "react";
import LoginForm from "@/components/auth/LoginForm";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

export const metadata = { title: "เข้าสู่ระบบ | Demo Tech Engineer" };

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "primary.main",
          }}
        >
          <CircularProgress sx={{ color: "#fff" }} />
        </Box>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
