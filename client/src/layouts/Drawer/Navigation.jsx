import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import useStoreCourse from "../../hooks/useStoreCourse";
import { menuItems } from "../../menu-items";
import NavGroup from "./NavGroup";
import useAuth from "../../hooks/useAuth";
import useStoreLayout from "../../hooks/useStoreLayout";

function Navigation() {
  const course = useStoreCourse((state) => state.course);
  const courseType = useStoreLayout((state) => state.courseType);
  const { isAdmin } = useAuth();
  const [menu, setMenu] = useState({ items: [] });

  useEffect(() => {
    setMenu(menuItems(course, courseType, isAdmin()));
  }, [course, courseType, isAdmin()]);

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

  return <Box sx={{ pt: 1 }}>{navGroups}</Box>;
}

export default Navigation;
