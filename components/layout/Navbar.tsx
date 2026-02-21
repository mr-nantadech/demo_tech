"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Avatar from "@mui/material/Avatar";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import EngineeringIcon from "@mui/icons-material/Engineering";

const publicNavLinks = [
  { label: "หน้าแรก", href: "/" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "เกี่ยวกับเรา", href: "/about" },
];

const protectedNavLinks = [
  { label: "ใบเสนอราคา", href: "/quotation" },
  { label: "ประวัติงาน", href: "/history-job" },
  { label: "ข้อมูลหลัก", href: "/master-data" },
];

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <AppBar position="sticky" elevation={1} sx={{ bgcolor: "primary.main" }}>
      <Toolbar>
        {/* Logo */}
        <Box
          component={Link}
          href="/"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            textDecoration: "none",
            color: "inherit",
            mr: 3,
          }}
        >
          <EngineeringIcon sx={{ fontSize: 28 }} />
          <Typography variant="h6" fontWeight={700} noWrap>
            NBA Tech
          </Typography>
        </Box>

        {/* Public Nav */}
        <Box sx={{ display: "flex", gap: 0.5 }}>
          {publicNavLinks.map((link) => (
            <Button
              key={link.href}
              component={Link}
              href={link.href}
              color="inherit"
              sx={{
                fontWeight: isActive(link.href) ? 700 : 400,
                borderBottom: isActive(link.href)
                  ? "2px solid #fff"
                  : "2px solid transparent",
                borderRadius: 0,
                px: 1.5,
              }}
            >
              {link.label}
            </Button>
          ))}

          {/* Protected Nav - show only when logged in */}
          {session && (
            <>
              <Divider
                orientation="vertical"
                flexItem
                sx={{ mx: 1, borderColor: "rgba(255,255,255,0.3)" }}
              />
              {protectedNavLinks.map((link) => (
                <Button
                  key={link.href}
                  component={Link}
                  href={link.href}
                  color="inherit"
                  sx={{
                    fontWeight: isActive(link.href) ? 700 : 400,
                    borderBottom: isActive(link.href)
                      ? "2px solid #fff"
                      : "2px solid transparent",
                    borderRadius: 0,
                    px: 1.5,
                  }}
                >
                  {link.label}
                </Button>
              ))}
            </>
          )}
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {/* Auth section */}
        {session ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Chip
              icon={<AccountCircleIcon />}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              label={(session.user as any)?.username || session.user?.name}
              color="default"
              sx={{ bgcolor: "rgba(255,255,255,0.15)", color: "#fff", "& .MuiChip-icon": { color: "#fff" } }}
            />
            <IconButton color="inherit" onClick={handleMenuOpen} size="small">
              <Avatar sx={{ width: 32, height: 32, bgcolor: "secondary.main", fontSize: 14 }}>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {((session.user as any)?.username || session.user?.name || "U")[0].toUpperCase()}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
              <MenuItem disabled sx={{ fontSize: 12, opacity: 0.7 }}>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {(session.user as any)?.username || session.user?.name}
              </MenuItem>
              <Divider />
              <MenuItem
                onClick={() => { handleMenuClose(); signOut({ callbackUrl: "/" }); }}
                sx={{ color: "error.main", gap: 1 }}
              >
                <LogoutIcon fontSize="small" />
                ออกจากระบบ
              </MenuItem>
            </Menu>
          </Box>
        ) : (
          <Button
            component={Link}
            href="/login"
            variant="outlined"
            color="inherit"
            startIcon={<LoginIcon />}
            sx={{ borderColor: "rgba(255,255,255,0.5)" }}
          >
            เข้าสู่ระบบ
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
}
