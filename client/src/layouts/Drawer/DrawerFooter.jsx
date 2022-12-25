import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import { useState } from "react";
import useTheme from "@mui/material/styles/useTheme";

function DrawerFooter() {
  const [value] = useState(import.meta.env.VITE_RUN_MODE);

  const theme = useTheme();

  return (
    <Stack direction="row" padding={1} width="100%">
      {value === "local" && (
        <Chip
          label="Dev (Local)"
          size="small"
          sx={{ backgroundColor: theme.palette.error.main }}
        />
      )}
      {value === "dev" && (
        <Chip
          label="Dev (Staging)"
          size="small"
          sx={{ backgroundColor: theme.palette.warning.main }}
        />
      )}
      {value === "prod" && (
        <Chip
          label="PRODUCTION"
          size="small"
          color="secondary"
          sx={{
            color: theme.palette.text.primary,
            backgroundColor: theme.palette.secondary.main,
          }}
        />
      )}
    </Stack>
  );
}

export default DrawerFooter;
