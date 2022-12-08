import ArrowRightOutlined from "@ant-design/icons/ArrowRightOutlined";
import PlusOutlined from "@ant-design/icons/PlusOutlined";
import Fab from "@mui/material/Fab";
import useTheme from "@mui/material/styles/useTheme";
import { useState } from "react";
import NiceModal from "@ebay/nice-modal-react";

/**
 * Component that represents the MUI SpeedDial component for the
 * "Your Courses" page.
 * @returns A component representing the "Your Courses" expandable FAB.
 */
function CoursesSpeedDial() {
  const theme = useTheme();

  // speed dial toggler
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(!open);
  };

  const actions = [
    {
      icon: <PlusOutlined />,
      name: "Create",
      onClick: () => NiceModal.show("create-course"),
    },
    {
      icon: <ArrowRightOutlined />,
      name: "Join",
      onClick: () => NiceModal.show("join-course"),
    },
  ];

  return (
    <Fab
      onClick={() => NiceModal.show("create-course")}
      sx={{
        position: "fixed",
        backgroundColor: "#58B7BF",
        color: "#fff",
        fontSize: "14px",
        fontWeight: 600,
        bottom: "20px",
        right: { xs: theme.spacing(2), md: theme.spacing(3) },
        transform: "translateZ(0px)",
        flexGrow: 1,
        zIndex: theme.zIndex.speedDial,
        "&:hover": {
          backgroundColor: "#58B7BF",
        },
      }}
    >
   
      <PlusOutlined style={{ fontSize: "24px" }} />
    </Fab>
    // <>
    //   <Box
    //     sx={{
    //       position: "fixed",
    //       bottom: theme.spacing(2),
    //       right: theme.spacing(2),
    //       transform: "translateZ(0px)",
    //       flexGrow: 1,
    //       zIndex: theme.zIndex.speedDial,
    //     }}
    //   >
    //     <SpeedDial
    //       ariaLabel="Courses SpeedDial"
    //       sx={{ position: "absolute", bottom: 16, right: 16 }}
    //       icon={<SpeedDialIcon />}
    //       onClick={handleOpen}
    //       open={open}
    //     >
    //       {actions.map((action) => (
    //         <SpeedDialAction
    //           key={action.name}
    //           icon={action.icon}
    //           tooltipTitle={action.name}
    //           onClick={action.onClick}
    //         />
    //       ))}
    //     </SpeedDial>
    //   </Box>
    // </>
  );
}

export default CoursesSpeedDial;
