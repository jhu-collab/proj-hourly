import { useState } from "react";
import PropTypes from "prop-types";
import useTheme from "@mui/material/styles/useTheme";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import LogoutOutlined from "@ant-design/icons/LogoutOutlined";
import UserOutlined from "@ant-design/icons/UserOutlined";
import { useNavigate } from "react-router-dom";
import { useAccountStore } from "../../services/store";

function ProfileMenu() {
  const theme = useTheme();

  const setId = useAccountStore((state) => state.setId);
  const setName = useAccountStore((state) => state.setName);

  const navigate = useNavigate();

  const handleLogout = async () => {
    setId();
    setName();
    navigate("/login");
  };

  const handleProfile = () => {
    navigate("/profile");
  };

  const [selectedIndex, setSelectedIndex] = useState(-1);
  const handleListItemClick = (event, index) => {
    setSelectedIndex(index);
    if (index == 0) {
      handleProfile();
    } else if (index == 1) {
      handleLogout();
    }
  };

  return (
    <List
      component="nav"
      sx={{
        p: 0,
        "& .MuiListItemIcon-root": {
          minWidth: 32,
          color: theme.palette.grey[500],
        },
      }}
    >
      <ListItemButton
        selected={selectedIndex === 0}
        onClick={(event) => handleListItemClick(event, 0)}
      >
        <ListItemIcon>
          <UserOutlined />
        </ListItemIcon>
        <ListItemText primary="Profile" />
      </ListItemButton>
      <ListItemButton
        selected={selectedIndex === 1}
        onClick={(event) => handleListItemClick(event, 1)}
      >
        <ListItemIcon>
          <LogoutOutlined />
        </ListItemIcon>
        <ListItemText primary="Logout" />
      </ListItemButton>
    </List>
  );
}

export default ProfileMenu;

ProfileMenu.propTypes = {
  handleLogout: PropTypes.func,
};
