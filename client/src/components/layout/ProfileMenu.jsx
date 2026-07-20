import {
  Avatar,
  Box,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";

import { useState } from "react";

export default function ProfileMenu() {
  const [anchorEl, setAnchorEl] = useState(null);

  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
        <Avatar
          sx={{
            bgcolor: "primary.main",
          }}
        >
          A
        </Avatar>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
      >
        <Box px={2} py={1}>
          <Typography fontWeight={600}>
            Administrator
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            admin@pnrgfinance.com
          </Typography>
        </Box>

        <Divider />

        <MenuItem>My Profile</MenuItem>

        <MenuItem>Change Password</MenuItem>

        <Divider />

        <MenuItem
          sx={{
            color: "error.main",
          }}
        >
          Logout
        </MenuItem>
      </Menu>
    </>
  );
}