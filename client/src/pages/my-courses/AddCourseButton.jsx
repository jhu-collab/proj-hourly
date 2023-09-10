import PlusOutlined from "@ant-design/icons/PlusOutlined";
import Fab from "@mui/material/Fab";
import useTheme from "@mui/material/styles/useTheme";
import NiceModal from "@ebay/nice-modal-react";

/**
 * Component that represents the MUI Fab component for the
 * "My Courses" page.
 * @returns A component representing the "My Courses" Add Course FAB.
 */
function AddCourseButton() {
  const theme = useTheme();

  return (
    <Fab
      onClick={() => NiceModal.show("join-course")}
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
      data-cy="add-course-button"
    >
      <PlusOutlined style={{ fontSize: "24px" }} />
    </Fab>
  );
}

export default AddCourseButton;
