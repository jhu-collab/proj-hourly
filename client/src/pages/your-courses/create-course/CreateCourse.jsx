import { Stack, Typography, useTheme } from "@mui/material";
import Popup from "../../../components/Popup";

function CreateCourse({ open, handlePopupToggle }) {
  const theme = useTheme();
  return (
    <Popup open={open} onClose={handlePopupToggle}>
      <Stack direction="column" alignItems="center" spacing={theme.spacing(2)}>
        <Typography variant="h2">Create Course</Typography>
 
      </Stack>
    </Popup>
  );
}

export default CreateCourse;
