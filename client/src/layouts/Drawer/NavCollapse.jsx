import PropTypes from "prop-types";
import { useEffect } from "react";
import Avatar from "@mui/material/Avatar";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import useStoreLayout from "../../hooks/useStoreLayout";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import List from "@mui/material/List";
import DownOutlined from "@ant-design/icons/DownOutlined";
import NavItem from "./NavItem";

function NavCollapse({ item, level }) {
  const openSidebar = useStoreLayout((state) => state.openSidebar);
  const selectedSidebarItem = useStoreLayout(
    (state) => state.selectedSidebarItem
  );
  const selectSidebarItem = useStoreLayout((state) => state.selectSidebarItem);

  let itemTarget = "_self";
  if (item.target) {
    itemTarget = "_blank";
  }

  if (item?.external) {
    listItemProps = { component: "a", href: item.url, target: itemTarget };
  }

  const Icon = item.icon;
  const itemIcon = item.icon && (
    <Icon style={{ fontSize: openSidebar ? "1rem" : "1.25rem" }} />
  );

  const isSelected = item.id === selectedSidebarItem;

  // active menu item on page load
  useEffect(() => {
    const currentIndex = document.location.pathname
      .toString()
      .split("/")
      .findIndex((id) => id === item.id);
    if (currentIndex > -1) {
      selectSidebarItem(item.id);
    }
    // eslint-disable-next-line
  }, []);

  const textColor = "text.primary";
  const iconSelectedColor = "text.primary";

  const navChildren = item.children?.map((menuItem) => {
    switch (menuItem.type) {
      case "item":
        return <NavItem key={menuItem.id} item={menuItem} level={2} />;
      default:
        return (
          <Typography
            key={menuItem.id}
            variant="h6"
            color="error"
            align="center"
          >
            Fix - Items
          </Typography>
        );
    }
  });

  return (
    <Accordion elevation={0} disableGutters sx={{ bgcolor: "primary.main" }}>
      <AccordionSummary
        sx={{
          zIndex: 1201,
          pl: openSidebar ? `${level * 28}px` : 1.5,
          ...(openSidebar && {
            "&:hover": {
              bgcolor: "secondary.main",
              borderRadius: 1,
            },
          }),
          ...(!openSidebar && {
            "&:hover": {
              bgcolor: "transparent",
            },
          }),
        }}
        expandIcon={<DownOutlined />}
      >
        {itemIcon && (
          <ListItemIcon
            sx={{
              minWidth: 28,
              alignItems: "center",
              color: isSelected ? iconSelectedColor : textColor,
              ...(!openSidebar && {
                borderRadius: 1.5,
                width: 36,
                height: 36,
                alignItems: "center",
                justifyContent: "center",
                "&:hover": {
                  bgcolor: "secondary.main",
                },
              }),
              ...(!openSidebar &&
                isSelected && {
                  bgcolor: "primary.main",
                  "&:hover": {
                    bgcolor: "primary.main",
                  },
                }),
            }}
          >
            {itemIcon}
          </ListItemIcon>
        )}
        {(openSidebar || (!openSidebar && level !== 1)) && (
          <ListItemText
            primary={
              <Typography
                variant="h6"
                sx={{ color: isSelected ? iconSelectedColor : textColor }}
              >
                {item.title}
              </Typography>
            }
          />
        )}
        {(openSidebar || (!openSidebar && level !== 1)) && item.chip && (
          <Chip
            color={item.chip.color}
            variant={item.chip.variant}
            size={item.chip.size}
            label={item.chip.label}
            avatar={item.chip.avatar && <Avatar>{item.chip.avatar}</Avatar>}
          />
        )}
      </AccordionSummary>
      <AccordionDetails sx={{ padding: 0 }}>
        <List sx={{ py: 0, zIndex: 0 }}>{navChildren}</List>
      </AccordionDetails>
    </Accordion>
  );
}

export default NavCollapse;

NavCollapse.propTypes = {
  item: PropTypes.object,
  level: PropTypes.number,
};
