import { PlusOutlined, ArrowRightOutlined } from "@ant-design/icons";
import {
  Box,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  useTheme,
} from "@mui/material";
import React from "react";

const actions = [
  { icon: <PlusOutlined />, name: "Create" },
  { icon: <ArrowRightOutlined />, name: "Join" },
];

function CoursesSpeedDial() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: theme.spacing(2),
        right: theme.spacing(2),
        transform: "translateZ(0px)",
        flexGrow: 1,
        zIndex: theme.zIndex.speedDial,
      }}
    >
      <SpeedDial
        ariaLabel="Courses SpeedDial"
        sx={{ position: "absolute", bottom: 16, right: 16 }}
        icon={<SpeedDialIcon />}
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={action.onClick}
          />
        ))}
      </SpeedDial>
    </Box>
  );
}

export default CoursesSpeedDial;
