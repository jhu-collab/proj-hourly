import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import { menuItems } from "../../menu-items";
import useStore from "../../services/store";
import NavGroup from "./NavGroup";


function Navigation() {
  const { currentCourse } = useStore();
  const [ menu, setMenu] = useState({items: []});

  useEffect(() => {
    setMenu(menuItems(currentCourse));
  }, [currentCourse])
  
  const navGroups = menu.items.map((item) => {
    switch (item.type) {
      case "group":
        return <NavGroup key={item.id} item={item} />;
      default:
        return (
          <Typography key={item.id} variant="h6" color="error" align="center">
            Fix - Navigation Group
          </Typography>
        );
    }
  });

  return <Box sx={{ pt: 2 }}>{navGroups}</Box>;
}

export default Navigation;
