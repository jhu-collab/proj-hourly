import ArrowRightOutlined from "@ant-design/icons/ArrowRightOutlined";
import PlusOutlined from "@ant-design/icons/PlusOutlined";
import Box from "@mui/material/Box";
import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialAction from "@mui/material/SpeedDialAction";
import SpeedDialIcon from "@mui/material/SpeedDialIcon";
import useTheme from "@mui/material/styles/useTheme";
import { useState } from "react";
import useStore from "../../services/store";
import CreateCourse from "./create-course/CreateCourse";
import JoinCourse from "./join-course/JoinCourse";

/**
 * Component that represents the MUI SpeedDial component for the
 * "Your Courses" page.
 * @returns A component representing the "Your Courses" expandable FAB.
 */
function CoursesSpeedDial() {
  const theme = useTheme();

  const {
    createCoursePopup,
    toggleCreateCoursePopup,
    joinCoursePopup,
    toggleJoinCoursePopup,
  } = useStore();

  // speed dial toggler
  const [open, setOpen] = useState(false);

  const handleOpen = (event) => {
    setOpen(!open);
  };

  // create popup toggler
  const [openCreatePopup, setOpenCreatePopup] = useState(createCoursePopup);
  const handleCreatePopupToggle = () => {
    setOpenCreatePopup(!openCreatePopup);
    toggleCreateCoursePopup(!openCreatePopup);
  };

  // join popup toggler
  const [openJoinPopup, setOpenJoinPopup] = useState(joinCoursePopup);
  const handleJoinPopupToggle = () => {
    setOpenJoinPopup(!openJoinPopup);
    toggleJoinCoursePopup(!openJoinPopup);
  };

  const actions = [
    {
      icon: <PlusOutlined />,
      name: "Create",
      onClick: handleCreatePopupToggle,
    },
    {
      icon: <ArrowRightOutlined />,
      name: "Join",
      onClick: handleJoinPopupToggle,
    },
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
      <CreateCourse
        open={openCreatePopup}
        handlePopupToggle={handleCreatePopupToggle}
      />
      <JoinCourse
        open={openJoinPopup}
        handlePopupToggle={handleJoinPopupToggle}
      />
    </>
  );
}

export default CoursesSpeedDial;
