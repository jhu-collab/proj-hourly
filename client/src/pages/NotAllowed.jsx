import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";

function NotAllowed() {
  return (
    <Alert severity="error">
      <AlertTitle>403</AlertTitle>
      YOU ARE NOT AUTHORIZED TO ACCESS THIS PAGE!
    </Alert>
  );
}

export default NotAllowed;
