import useTheme from "@mui/material/styles/useTheme";
import BottomNavigation from "@mui/material/BottomNavigation";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Chip from "@mui/material/Chip";

import { useState } from "react";

function DrawerFooter() {
  const theme = useTheme();
  const [value] = useState(import.meta.env.VITE_RUN_MODE);

  return (
    <BottomNavigation sx={{ padding: theme.spacing(1) }}>
      <List>
        {value === "local" && (
          <ListItem>
            <Chip label="Dev (Local)" size="small" color="secondary" />
          </ListItem>
        )}
        {value === "dev" && (
          <ListItem>
            <Chip label="Dev (Staging)" size="small" />
          </ListItem>
        )}
        {value === "prod" && (
          <ListItem>
            <Chip label="PRODUCTION" size="small" variant="outlined" />
          </ListItem>
        )}
      </List>
    </BottomNavigation>
  );
}

export default DrawerFooter;
