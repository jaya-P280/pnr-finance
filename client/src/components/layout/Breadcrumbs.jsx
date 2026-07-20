import {
  Breadcrumbs,
  Link,
  Typography,
} from "@mui/material";

import NavigateNextIcon from "@mui/icons-material/NavigateNext";

import {
  Link as RouterLink,
  useLocation,
} from "react-router-dom";

export default function AppBreadcrumbs() {
  const location = useLocation();

  const paths = location.pathname
    .split("/")
    .filter(Boolean);

  return (
    <Breadcrumbs
      separator={<NavigateNextIcon fontSize="small" />}
    >
      <Link
        component={RouterLink}
        underline="hover"
        color="inherit"
        to="/dashboard"
      >
        Dashboard
      </Link>

      {paths.map((path, index) => {
        const url =
          "/" + paths.slice(0, index + 1).join("/");

        const last = index === paths.length - 1;

        return last ? (
          <Typography key={url}>
            {path.replaceAll("-", " ")}
          </Typography>
        ) : (
          <Link
            key={url}
            component={RouterLink}
            underline="hover"
            color="inherit"
            to={url}
          >
            {path.replaceAll("-", " ")}
          </Link>
        );
      })}
    </Breadcrumbs>
  );
}