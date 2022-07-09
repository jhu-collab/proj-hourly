import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import BottomNavigation from "@mui/material/BottomNavigation";
import { useTheme } from "@mui/material/styles";
import { useState } from "react";

function DrawerFooter() {
  const theme = useTheme();
  const [value] = useState(import.meta.env.VITE_RUN_MODE);

  return (
    <BottomNavigation sx={{ padding: theme.spacing(1) }}>
      <Grid container justifyContent="space-between" alignItems="center">
        <Grid item>
          <Typography>Application footer</Typography>
        </Grid>
        {value === "local" && (
          <Grid item>
            <Chip
              label="Dev (Local)"
              sx={{
                color: "white",
                background: "linear-gradient(to right bottom, indigo, cyan)",
              }}
            />
          </Grid>
        )}
        {value === "dev" && (
          <Grid item>
            <Chip
              label="Dev (Staging)"
              sx={{
                color: "white",
                background: "linear-gradient(to right bottom, teal, lime)",
              }}
            />
          </Grid>
        )}
        {value === "prod" && (
          <Grid item>
            <Chip
              label="PRODUCTION"
              sx={{
                color: "white",
                background: "linear-gradient(to right bottom, orange, red)",
              }}
            />
          </Grid>
        )}
      </Grid>
    </BottomNavigation>
  );
}

export default DrawerFooter;
