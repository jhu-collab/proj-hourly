import { PlusOutlined, ArrowRightOutlined } from "@ant-design/icons";
import {
  Box,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  useTheme,
} from "@mui/material";
import React, { useState } from "react";
import useStore from "../../services/store";
import CreateCourse from "./create-course/CreateCourse";

function CoursesSpeedDial() {
  const theme = useTheme();

  const { createCoursePopup, toggleCreateCoursePopup } = useStore();

  // speed dial toggler
  const [open, setOpen] = React.useState(false);

  const handleOpen = (event) => {
    setOpen(!open);
  };

  // popup toggler
  const [openPopup, setOpenPopup] = useState(createCoursePopup);
  const handlePopupToggle = () => {
    setOpenPopup(!openPopup);
    toggleCreateCoursePopup(!openPopup);
  };

  const actions = [
    { icon: <PlusOutlined />, name: "Create", onClick: handlePopupToggle },
    { icon: <ArrowRightOutlined />, name: "Join" },
  ];

  return (
    <>
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
          onClick={handleOpen}
          open={open}
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
      <CreateCourse open={openPopup} handlePopupToggle={handlePopupToggle} />
    </>
  );
}

export default CoursesSpeedDial;
