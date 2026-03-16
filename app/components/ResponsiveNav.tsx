"use client";

import * as React from "react";
import Link from "next/link";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import HandymanIcon from "@mui/icons-material/Handyman";
import ViewInArIcon from "@mui/icons-material/ViewInAr";
import HistoryIcon from "@mui/icons-material/History";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import LogoutIcon from "@mui/icons-material/Logout";
import { usePathname, useRouter } from "next/navigation";

export default function ResponsiveNav() {
  const theme = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const isLoginRoute = pathname === "/login" || pathname?.startsWith("/login/") || false;
  const [mounted, setMounted] = React.useState(false);
  const isDesktop = useMediaQuery(theme.breakpoints.up("sm"), { noSsr: true });
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!pathname || isLoginRoute) return null;
  if (!mounted) return null;

  const nav = (
    <Box sx={{ width: 220, background: "#0b1220", height: "100%", color: "#fff", p: 2, display: "flex", flexDirection: "column" }}>
      <Typography sx={{ fontWeight: 800, fontSize: 18, mb: 2 }}>Ferramentaria</Typography>
      <List>
        <ListItem>
          <ListItemText primary={<Link href="/dashboard" style={{ color: "#e6eef8", textDecoration: "none", fontWeight: 600, display: 'flex', alignItems: 'center' }}><DashboardIcon sx={{ mr: 1 }} />Dashboard</Link>} />
        </ListItem>
        <ListItem>
          <ListItemText primary={<Link href="/moldes" style={{ color: "#e6eef8", textDecoration: "none", fontWeight: 600, display: 'flex', alignItems: 'center' }}><ViewInArIcon sx={{ mr: 1 }} />Moldes</Link>} />
        </ListItem>
        <ListItem>
          <ListItemText primary={<Link href="/ferramentas" style={{ color: "#e6eef8", textDecoration: "none", fontWeight: 600, display: 'flex', alignItems: 'center' }}><HandymanIcon sx={{ mr: 1 }} />Ferramentas</Link>} />
        </ListItem>
        <ListItem>
          <ListItemText primary={<Link href="/historico-geral" style={{ color: "#e6eef8", textDecoration: "none", fontWeight: 600, display: 'flex', alignItems: 'center' }}><HistoryIcon sx={{ mr: 1 }} />Histórico Geral</Link>} />
        </ListItem>
      </List>
      <Box sx={{ mt: "auto", pt: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<LogoutIcon />}
          onClick={() => {
            setOpen(false);
            router.push("/login");
          }}
          sx={{
            color: "#e6eef8",
            borderColor: "rgba(230,238,248,0.45)",
            justifyContent: "flex-start",
            '&:hover': {
              borderColor: "#e6eef8",
              backgroundColor: "rgba(230,238,248,0.08)",
            },
          }}
        >
          Sair
        </Button>
      </Box>
    </Box>
  );

  return (
    <>
      {!isDesktop && (
        <AppBar position="sticky" color="primary" sx={{ bgcolor: "#0b1220", zIndex: (theme) => (theme.zIndex.drawer || 1200) + 1 }}>
          <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
            <IconButton edge="start" color="inherit" aria-label="menu" onClick={() => setOpen(true)}>
              <MenuIcon />
            </IconButton>
            <Typography sx={{ fontWeight: 700 }}>Ferramentaria</Typography>
            <Box />
          </Toolbar>
        </AppBar>
      )}

      <nav>
        <Drawer
          variant={isDesktop ? "permanent" : "temporary"}
          open={isDesktop ? true : open}
          onClose={() => setOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            [`& .MuiDrawer-paper`]: { width: 220, boxSizing: "border-box", top: 0, height: "100vh" },
            display: { xs: open ? "block" : "none", sm: "block" },
          }}
          PaperProps={{ style: { position: isDesktop ? 'fixed' : undefined } }}
        >
          {nav}
        </Drawer>
      </nav>
    </>
  );
}
