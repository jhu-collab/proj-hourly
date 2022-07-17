import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import NavItem from "./NavItem";
import useStore from "../../services/store";

function NavGroup({ item }) {
  const { openSidebar } = useStore();

  const navCollapse = item.children?.map((menuItem) => {
    switch (menuItem.type) {
      case "collapse":
        return (
          <Typography
            key={menuItem.id}
            variant="caption"
            color="error"
            sx={{ p: 2.5 }}
          >
            collapse - only available in paid version
          </Typography>
        );
      case "item":
        return <NavItem key={menuItem.id} item={menuItem} level={1} />;
      default:
        return (
          <Typography
            key={menuItem.id}
            variant="h6"
            color="error"
            align="center"
          >
            Fix - Group Collapse or Items
          </Typography>
        );
    }
  });

  return (
    <List
      subheader={
        item.title &&
        openSidebar && (
          <Box sx={{ pl: 3, mb: 1.5 }}>
            <Typography variant="subtitle2" color="textSecondary">
              {item.title}
            </Typography>
            {/* only available in paid version */}
          </Box>
        )
      }
      sx={{ mb: openSidebar ? 1.5 : 0, py: 0, zIndex: 0 }}
    >
      {navCollapse}
    </List>
  );
}

export default NavGroup;

NavGroup.propTypes = {
  item: PropTypes.object,
};
