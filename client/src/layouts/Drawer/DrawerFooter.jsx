import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Chip from "@mui/material/Chip";
import { useState } from "react";

function DrawerFooter() {
  const [value] = useState(import.meta.env.VITE_RUN_MODE);

  return (
    <List>
      {value === "local" && (
        <ListItem>
          <Chip label="Dev (Local)" size="small" color="error" />
        </ListItem>
      )}
      {value === "dev" && (
        <ListItem>
          <Chip label="Dev (Staging)" size="small" color="warning" />
        </ListItem>
      )}
      {value === "prod" && (
        <ListItem>
          <Chip
            label="PRODUCTION"
            size="small"
            color="secondary"
            sx={{ color: "#000" }}
          />
        </ListItem>
      )}
    </List>
  );
}

export default DrawerFooter;
