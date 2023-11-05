import { Outlet } from "react-router-dom";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import useQueryMyRole from "../hooks/useQueryMyRole";

function CourseWrapper() {
  const { isLoading, error } = useQueryMyRole();

  if (isLoading) {
    return (
      <Alert severity="warning" sx={{ mt: 2 }}>
        <AlertTitle>Loading course ...</AlertTitle>
      </Alert>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        <AlertTitle>Error</AlertTitle>
        {"An error has occurred: " + error.message}
      </Alert>
    );
  }

  return <Outlet />;
}

export default CourseWrapper;
