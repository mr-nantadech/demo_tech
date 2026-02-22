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
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import EngineeringIcon from "@mui/icons-material/Engineering";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import WorkIcon from "@mui/icons-material/Work";
import InfoIcon from "@mui/icons-material/Info";
import DescriptionIcon from "@mui/icons-material/Description";
import HistoryIcon from "@mui/icons-material/History";
import StorageIcon from "@mui/icons-material/Storage";
import CloseIcon from "@mui/icons-material/Close";

const publicNavLinks = [
  { label: "หน้าแรก", href: "/", icon: <HomeIcon fontSize="small" /> },
  { label: "Portfolio", href: "/portfolio", icon: <WorkIcon fontSize="small" /> },
  { label: "เกี่ยวกับเรา", href: "/about", icon: <InfoIcon fontSize="small" /> },
];

const protectedNavLinks = [
  { label: "ใบเสนอราคา", href: "/quotation", icon: <DescriptionIcon fontSize="small" /> },
  { label: "ประวัติงาน", href: "/history-job", icon: <HistoryIcon fontSize="small" /> },
  { label: "ข้อมูลหลัก", href: "/master-data", icon: <StorageIcon fontSize="small" /> },
];

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const username = (session?.user as any)?.username || session?.user?.name || "U";

  const navButtonSx = (href: string) => ({
    fontWeight: isActive(href) ? 700 : 400,
    borderBottom: isActive(href) ? "2px solid #fff" : "2px solid transparent",
    borderRadius: 0,
    px: 1.5,
    whiteSpace: "nowrap" as const,
  });

  return (
    <>
      <AppBar position="sticky" elevation={1} sx={{ bgcolor: "primary.main" }}>
        <Toolbar sx={{ gap: 0.5 }}>

          {/* Hamburger — mobile only */}
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setDrawerOpen(true)}
            sx={{ display: { xs: "flex", md: "none" }, mr: 0.5 }}
          >
            <MenuIcon />
          </IconButton>

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
              mr: { xs: 0, md: 3 },
              flexShrink: 0,
            }}
          >
            <EngineeringIcon sx={{ fontSize: 28 }} />
            <Typography variant="h6" fontWeight={700} noWrap>
              NBA Tech
            </Typography>
          </Box>

          {/* Desktop Nav — hidden on mobile */}
          <Box sx={{ display: { xs: "none", md: "flex" }, gap: 0.5, alignItems: "center" }}>
            {publicNavLinks.map((link) => (
              <Button
                key={link.href}
                component={Link}
                href={link.href}
                color="inherit"
                sx={navButtonSx(link.href)}
              >
                {link.label}
              </Button>
            ))}

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
                    sx={navButtonSx(link.href)}
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
              {/* Username chip — desktop only */}
              <Chip
                icon={<AccountCircleIcon />}
                label={username}
                color="default"
                sx={{
                  display: { xs: "none", sm: "flex" },
                  bgcolor: "rgba(255,255,255,0.15)",
                  color: "#fff",
                  "& .MuiChip-icon": { color: "#fff" },
                }}
              />
              <IconButton color="inherit" onClick={handleMenuOpen} size="small">
                <Avatar sx={{ width: 32, height: 32, bgcolor: "secondary.main", fontSize: 14 }}>
                  {username[0].toUpperCase()}
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
                  {username}
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
              sx={{ borderColor: "rgba(255,255,255,0.5)", whiteSpace: "nowrap" }}
            >
              <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
                เข้าสู่ระบบ
              </Box>
              <Box component="span" sx={{ display: { xs: "inline", sm: "none" } }}>
                Login
              </Box>
            </Button>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: 280 } }}
      >
        {/* Drawer Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
            py: 1.5,
            bgcolor: "primary.main",
            color: "#fff",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <EngineeringIcon />
            <Typography fontWeight={700}>NBA Tech</Typography>
          </Box>
          <IconButton color="inherit" size="small" onClick={() => setDrawerOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* User info (mobile) */}
        {session && (
          <Box sx={{ px: 2, py: 1.5, bgcolor: "primary.dark", color: "#fff" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Avatar sx={{ bgcolor: "secondary.main", width: 36, height: 36, fontSize: 15 }}>
                {username[0].toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="body2" fontWeight={600}>{username}</Typography>
                <Typography variant="caption" sx={{ opacity: 0.7 }}>ผู้ใช้งาน</Typography>
              </Box>
            </Box>
          </Box>
        )}

        <Divider />

        {/* Public Links */}
        <List dense>
          {publicNavLinks.map((link) => (
            <ListItemButton
              key={link.href}
              component={Link}
              href={link.href}
              selected={isActive(link.href)}
              onClick={() => setDrawerOpen(false)}
              sx={{
                "&.Mui-selected": { bgcolor: "primary.main", color: "#fff", "& .MuiListItemIcon-root": { color: "#fff" } },
                "&.Mui-selected:hover": { bgcolor: "primary.dark" },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: isActive(link.href) ? "#fff" : "inherit" }}>
                {link.icon}
              </ListItemIcon>
              <ListItemText primary={link.label} />
            </ListItemButton>
          ))}
        </List>

        {/* Protected Links */}
        {session && (
          <>
            <Divider />
            <Box sx={{ px: 2, pt: 1.5, pb: 0.5 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
                จัดการงาน
              </Typography>
            </Box>
            <List dense>
              {protectedNavLinks.map((link) => (
                <ListItemButton
                  key={link.href}
                  component={Link}
                  href={link.href}
                  selected={isActive(link.href)}
                  onClick={() => setDrawerOpen(false)}
                  sx={{
                    "&.Mui-selected": { bgcolor: "primary.main", color: "#fff", "& .MuiListItemIcon-root": { color: "#fff" } },
                    "&.Mui-selected:hover": { bgcolor: "primary.dark" },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36, color: isActive(link.href) ? "#fff" : "inherit" }}>
                    {link.icon}
                  </ListItemIcon>
                  <ListItemText primary={link.label} />
                </ListItemButton>
              ))}
            </List>
          </>
        )}

        <Box sx={{ flexGrow: 1 }} />
        <Divider />

        {/* Footer actions */}
        <List dense>
          {session ? (
            <ListItemButton
              onClick={() => { setDrawerOpen(false); signOut({ callbackUrl: "/" }); }}
              sx={{ color: "error.main" }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: "error.main" }}>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="ออกจากระบบ" />
            </ListItemButton>
          ) : (
            <ListItemButton
              component={Link}
              href="/login"
              onClick={() => setDrawerOpen(false)}
              sx={{ color: "primary.main" }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: "primary.main" }}>
                <LoginIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="เข้าสู่ระบบ" />
            </ListItemButton>
          )}
        </List>
      </Drawer>
    </>
  );
}
