import {
  Drawer,
  Box,
  Typography,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
} from "@mui/material";
import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import IconButton from "@mui/material/IconButton";

import logo from "../../assets/logo.webp";
import menu from "../constants/menu";
import { DRAWER_WIDTH } from "../constants/layout.constants";

export default function Sidebar({ mobile, onClose, open, onToggleSidebar }) {
  const location = useLocation();
  const activePath = location.pathname;

  const activeSections = useMemo(
    () =>
      menu.reduce((acc, item) => {
        if (item.children) {
          acc[item.title] = item.children.some((child) =>
            activePath.startsWith(child.path),
          );
        }
        return acc;
      }, {}),
    [activePath],
  );

  const [expandedMenus, setExpandedMenus] = useState(() => activeSections);

  useEffect(() => {
    setExpandedMenus((prev) => ({ ...prev, ...activeSections }));
  }, [activeSections]);

  const toggleMenu = (title) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  return (
    <Drawer
      anchor="left"
      variant={mobile ? "temporary" : "persistent"}
      open={open}
      onClose={mobile ? onClose : undefined}
      ModalProps={{ keepMounted: true }}
      sx={{
        width: open ? DRAWER_WIDTH : 0,
        flexShrink: 0,
        overflowX: "hidden",
        transition: (theme) =>
          theme.transitions.create("width", {
            easing: theme.transitions.easing.easeInOut,
            duration: 300,
          }),
        "& .MuiDrawer-paper": {
          width: DRAWER_WIDTH,
          overflowX: "hidden",
          bgcolor: (theme) => theme.palette.sidebar.background,
          color: (theme) => theme.palette.sidebar.text,
          borderRight: "1px solid rgba(148, 163, 184, 0.12)",
          borderRadius: 0,
          transition: (theme) =>
            theme.transitions.create("width", {
              easing: theme.transitions.easing.easeInOut,
              duration: 300,
            }),
        },
      }}
    >
      <Box
        sx={{
          height: 80,
          px: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box component="img" src={logo} sx={{ width: 42, height: 42 }} />
          <Box>
            <Typography variant="h6" fontWeight={700} color="common.white">
              PNRG Finance
            </Typography>
            <Typography variant="caption" color="rgba(226,232,240,0.8)">
              Loan Management
            </Typography>
          </Box>
        </Box>

        <IconButton onClick={onToggleSidebar} sx={{ color: "#fff" }}>
          <MenuOpenIcon />
        </IconButton>
      </Box>

      <Divider sx={{ borderColor: "#334155" }} />

      <List sx={{ mt: 1, px: 1 }}>
        {menu.map((section) => (
          <Box key={section.section}>
            <Typography
              sx={{
                px: 3,
                py: 1.5,
                color: "#94A3B8",
                fontWeight: 700,
                fontSize: 12,
                textTransform: "uppercase",
              }}
            >
              {section.section}
            </Typography>

            {section.items.map((item) => {
              const Icon = item.icon;
              const hasChildren = item.children && item.children.length > 0;
              const itemActive = item.path ? activePath === item.path : false;
              const childActive = item.children
                ? item.children.some((child) =>
                    activePath.startsWith(child.path),
                  )
                : false;
              const active = itemActive || childActive;

              return (
                <Box key={item.title}>
                  <ListItemButton
                    component={hasChildren ? undefined : NavLink}
                    to={hasChildren ? undefined : item.path}
                    selected={active}
                    onClick={() => {
                      if (hasChildren) {
                        toggleMenu(item.title);
                      } else if (mobile) {
                        onClose();
                      }
                    }}
                    sx={{
                      mx: 1,
                      mb: 0.6,
                      borderRadius: 3,
                      color: "rgba(226,232,240,0.95)",
                      bgcolor: active
                        ? "rgba(56, 189, 248, 0.16)"
                        : "transparent",
                      border: active
                        ? "1px solid rgba(56, 189, 248, 0.2)"
                        : "transparent",
                      transition:
                        "background-color 150ms ease, border-color 150ms ease",
                      "&:hover": {
                        bgcolor: "rgba(148, 163, 184, 0.12)",
                      },
                    }}
                  >
                    <ListItemIcon sx={{ color: "inherit", minWidth: 42 }}>
                      {Icon && <Icon />}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.title}
                      slotProps={{
                        primary: {
                          fontWeight: active ? 700 : 500,
                          color: active ? "#fff" : "rgba(226,232,240,0.85)",
                        },
                      }}
                    />
                    {hasChildren &&
                      (expandedMenus[item.title] ? (
                        <ExpandLessIcon />
                      ) : (
                        <ExpandMoreIcon />
                      ))}
                  </ListItemButton>

                  {hasChildren && (
                    <Collapse
                      in={expandedMenus[item.title]}
                      timeout="auto"
                      unmountOnExit
                    >
                      <List disablePadding>
                        {item.children.map((child) => (
                          <ListItemButton
                            key={child.title}
                            component={NavLink}
                            to={child.path}
                            onClick={() => {
                              if (mobile) {
                                onClose();
                              }
                            }}
                            sx={{
                              pl: 8,
                              color: "#CBD5E1",
                              mb: 0.5,
                              borderRadius: 2,
                              bgcolor:
                                activePath === child.path
                                  ? "rgba(59, 130, 246, 0.2)"
                                  : "transparent",
                              "&:hover": {
                                bgcolor: "#1E293B",
                              },
                            }}
                          >
                            <ListItemText
                              primary={child.title}
                              slotProps={{
                                primary: {
                                  color:
                                    activePath === child.path
                                      ? "#fff"
                                      : "rgba(226,232,240,0.86)",
                                },
                              }}
                            />
                          </ListItemButton>
                        ))}
                      </List>
                    </Collapse>
                  )}
                </Box>
              );
            })}
          </Box>
        ))}
      </List>
    </Drawer>
  );
}
