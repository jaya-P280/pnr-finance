import { Box, Typography } from "@mui/material";

export default function SectionPage({ title, subtitle, children, actions }) {
  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          borderRadius:0,
          gap: 3,
          mb: 4,
          pb: 3,
          borderBottom: "2px solid #E2E8F0",
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={800} gutterBottom color="#0F172A">
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="#64748B" sx={{ mt: 1 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {actions}
      </Box>

      {children}
    </Box>
  );
}
