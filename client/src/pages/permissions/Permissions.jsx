import { useQuery } from "@tanstack/react-query";
import { Alert, Box, Chip, CircularProgress, Paper, Stack, Typography } from "@mui/material";
import SectionPage from "../../components/layout/SectionPage";
import permissionService from "../../services/permission.service";

export default function Permissions() {
  const groupedQuery = useQuery({
    queryKey: ["permissionsGrouped"],
    queryFn: () => permissionService.getGrouped(),
  });

  const groups = groupedQuery.data || [];

  return (
    <SectionPage title="Permissions" subtitle="Browse the full permission catalog, grouped by module.">
      {groupedQuery.isLoading ? <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}><CircularProgress /></Box>
        : groupedQuery.isError ? <Alert severity="error">Unable to load permissions.</Alert>
          : groups.map((group) => (
            <Paper key={group.moduleName} elevation={0} sx={{ border: "1px solid #E2E8F0", borderRadius: 3, p: 3, mb: 2 }}>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>{group.moduleName}</Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                {group.permissions.map((perm) => (
                  <Chip key={perm.permission_id} label={perm.permission_name} size="small" title={perm.description || ""} sx={{ mb: 1 }} />
                ))}
              </Stack>
            </Paper>
          ))}
    </SectionPage>
  );
}
