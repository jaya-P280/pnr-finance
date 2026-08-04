import { Card, CardContent, Typography, Box } from "@mui/material";

export default function DashboardCard({ title, value, icon, color }) {
  return (
    <Card elevation={0} sx={{ border: "1px solid #E2E8F0" }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" color="#64748B" fontWeight={500} mb={1}>
              {title}
            </Typography>

            <Typography variant="h4" fontWeight={800} color="#0F172A">
              {value}
            </Typography>
          </Box>

          <Box
            sx={{
              width: 70,
              height: 70,
              borderRadius: "14px",
              bgcolor: color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              flexShrink: 0,
              opacity: 0.15,
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
