"use client";

import { useEffect, useState } from "react";
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
import Image from "next/image";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import WorkIcon from "@mui/icons-material/Work";
import InfoIcon from "@mui/icons-material/Info";
import AssignmentIcon from "@mui/icons-material/Assignment";
import RequestQuoteIcon from "@mui/icons-material/RequestQuote";
import HistoryIcon from "@mui/icons-material/History";
import StorageIcon from "@mui/icons-material/Storage";
import FolderCopyIcon from "@mui/icons-material/FolderCopy";
import CloseIcon from "@mui/icons-material/Close";
import RouteIcon from "@mui/icons-material/Route";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";

const defaultLogoSrc = "/logo_corp.webp?v=20260319";

const publicNavLinks = [
  { label: "หน้าแรก", href: "/", icon: <HomeIcon fontSize="small" /> },
  { label: "ผลงาน", href: "/portfolio", icon: <WorkIcon fontSize="small" /> },
  { label: "เกี่ยวกับเรา", href: "/about", icon: <InfoIcon fontSize="small" /> },
  { label: "ขอใบเสนอราคา", href: "/request-quote", icon: <AssignmentIcon fontSize="small" /> },
];

const protectedNavLinks = [
  { label: "ใบเสนอราคา", href: "/project-files", icon: <FolderCopyIcon fontSize="small" /> },
  { label: "คำขอใบเสนอราคา", href: "/request-quotes", icon: <RequestQuoteIcon fontSize="small" /> },
  { label: "ประวัติงาน", href: "/history-job", icon: <HistoryIcon fontSize="small" /> },
  { label: "อัลบั้ม", href: "/album", icon: <PhotoLibraryIcon fontSize="small" /> },
  { label: "วางแผนเส้นทาง", href: "/map-planner", icon: <RouteIcon fontSize="small" /> },
  { label: "ข้อมูลหลัก", href: "/master-data", icon: <StorageIcon fontSize="small" /> },
];

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [logoSrc, setLogoSrc] = useState(defaultLogoSrc);
  const [newQuoteCount, setNewQuoteCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const loadCompany = async () => {
      try {
        const res = await fetch("/api/master-data/company", {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!res.ok) return;

        const data = (await res.json()) as { logoUrl?: string };
        if (data.logoUrl?.trim()) {
          setLogoSrc(data.logoUrl.trim());
        }
      } catch {
        // keep fallback logo
      }
    };

    void loadCompany();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!session) {
      setNewQuoteCount(0);
      return;
    }

    const controller = new AbortController();

    const loadQuotes = async () => {
      try {
        const res = await fetch("/api/request-quote", {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!res.ok) return;

        const data = (await res.json()) as {
          summary?: { newCount?: number };
        };
        setNewQuoteCount(data.summary?.newCount ?? 0);
      } catch {
        // ignore badge errors
      }
    };

    void loadQuotes();
    return () => controller.abort();
  }, [session]);

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
            <Image
              src={logoSrc}
              alt="NBA Tech"
              width={70}
              height={36}
              style={{ filter: "brightness(0) invert(1)", objectFit: "contain" }}
              priority
            />
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
                  <Box key={link.href} sx={{ position: "relative", display: "inline-flex" }}>
                    <Button
                      component={Link}
                      href={link.href}
                      color="inherit"
                      sx={navButtonSx(link.href)}
                    >
                      {link.label}
                    </Button>
                    {link.href === "/request-quotes" && newQuoteCount > 0 && (
                      <Chip
                        label={newQuoteCount}
                        color="warning"
                        size="small"
                        sx={{
                          position: "absolute",
                          top: 2,
                          right: -4,
                          height: 18,
                          minWidth: 18,
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      />
                    )}
                  </Box>
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
          <Image
            src={logoSrc}
            alt="NBA Tech"
            width={70}
            height={32}
            style={{ filter: "brightness(0) invert(1)", objectFit: "contain" }}
          />
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
                  {link.href === "/request-quotes" && newQuoteCount > 0 && (
                    <Chip
                      label={newQuoteCount}
                      color="warning"
                      size="small"
                      sx={{ height: 20, minWidth: 20, fontSize: 11, fontWeight: 700 }}
                    />
                  )}
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
