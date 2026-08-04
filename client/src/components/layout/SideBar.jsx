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
import { useMemo, useState } from "react";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import IconButton from "@mui/material/IconButton";
import getFilteredMenu from "../../components/constants/menu";
import useAuth from "../../hooks/useAuth";
import { DRAWER_WIDTH } from "../constants/layout.constants";

export default function Sidebar({ mobile, onClose, open, onToggleSidebar }) {
  const location = useLocation();
  const activePath = location.pathname;
  const { user } = useAuth();
  const roleName = user?.role_name || user?.role || "FIELD_OFFICER";
  const menuItems = useMemo(() => getFilteredMenu(roleName), [roleName]);

  const activeSections = useMemo(
    () =>
      menuItems.reduce((acc, item) => {
        if (item.children) {
          acc[item.title] = item.children.some((child) =>
            activePath.startsWith(child.path),
          );
        }
        return acc;
      }, {}),
    [activePath, menuItems],
  );

  const [expandedMenus, setExpandedMenus] = useState({});

  const toggleMenu = (title) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [title]: !(prev[title] ?? activeSections[title] ?? false),
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
        width: open && !mobile ? DRAWER_WIDTH : 0,
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
          bgcolor: "#0F172A",
          color: "#F8FAFC",
          borderRight: "1px solid rgba(255, 255, 255, 0.08)",
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
          px: 2.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          bgcolor: "#090D16",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 2,
              bgcolor: "#0F766E",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(15, 118, 110, 0.4)",
            }}
          >
            <AccountBalanceIcon sx={{ color: "#FFFFFF", fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight={800} color="#FFFFFF" letterSpacing="-0.3px">
              PNRG Finance
            </Typography>
            <Typography variant="caption" sx={{ color: "#94A3B8", fontWeight: 500, fontSize: "0.7rem" }}>
              Microfinance ERP
            </Typography>
          </Box>
        </Box>

        <IconButton onClick={onToggleSidebar} sx={{ color: "#94A3B8", "&:hover": { color: "#FFF" } }}>
          <MenuOpenIcon fontSize="small" />
        </IconButton>
      </Box>

      <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.08)" }} />

      <List sx={{ mt: 1, px: 1.5, pb: 4 }}>
        {menuItems.map((section) => (
          <Box key={section.section} sx={{ mb: 2 }}>
            <Typography
              sx={{
                px: 2,
                pt: 1.5,
                pb: 1,
                color: "#64748B",
                fontWeight: 700,
                fontSize: 11,
                letterSpacing: "0.5px",
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
              const expanded =
                expandedMenus[item.title] ??
                activeSections[item.title] ??
                false;

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
                      mb: 0.6,
                      borderRadius: 2.5,
                      px: 2,
                      py: 1.2,
                      color: active ? "#2DD4BF" : "#94A3B8",
                      bgcolor: active
                        ? "rgba(15, 118, 110, 0.22)"
                        : "transparent",
                      border: active
                        ? "1px solid rgba(45, 212, 191, 0.3)"
                        : "1px solid transparent",
                      position: "relative",
                      transition: "all 0.2s ease-in-out",
                      "&:hover": {
                        bgcolor: active ? "rgba(15, 118, 110, 0.3)" : "rgba(255, 255, 255, 0.05)",
                        color: "#F8FAFC",
                      },
                    }}
                  >
                    <ListItemIcon sx={{ color: "inherit", minWidth: 38 }}>
                      {Icon && <Icon sx={{ fontSize: 20 }} />}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.title}
                      slotProps={{
                        primary: {
                          fontWeight: active ? 700 : 500,
                          fontSize: "0.9rem",
                          color: active ? "#F8FAFC" : "#CBD5E1",
                        },
                      }}
                    />
                    {hasChildren &&
                      (expanded ? (
                        <ExpandLessIcon sx={{ fontSize: 18, color: "#94A3B8" }} />
                      ) : (
                        <ExpandMoreIcon sx={{ fontSize: 18, color: "#94A3B8" }} />
                      ))}
                  </ListItemButton>

                  {hasChildren && (
                    <Collapse
                      in={expanded}
                      timeout="auto"
                      unmountOnExit
                    >
                      <List disablePadding sx={{ pl: 2, mt: 0.5 }}>
                        {item.children.map((child) => {
                          const isChildActive = activePath === child.path;
                          return (
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
                                py: 0.9,
                                pl: 3.5,
                                color: isChildActive ? "#2DD4BF" : "#94A3B8",
                                mb: 0.4,
                                borderRadius: 2,
                                bgcolor: isChildActive
                                  ? "rgba(15, 118, 110, 0.2)"
                                  : "transparent",
                                "&:hover": {
                                  bgcolor: "rgba(255, 255, 255, 0.05)",
                                  color: "#F8FAFC",
                                },
                              }}
                            >
                              <ListItemText
                                primary={child.title}
                                slotProps={{
                                  primary: {
                                    fontSize: "0.83rem",
                                    fontWeight: isChildActive ? 700 : 500,
                                    color: isChildActive ? "#2DD4BF" : "#94A3B8",
                                  },
                                }}
                              />
                            </ListItemButton>
                          );
                        })}
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
