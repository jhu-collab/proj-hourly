import CloseOutlined from "@ant-design/icons/CloseOutlined";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import DialogContent from "@mui/material/DialogContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useConfirmDialogStore } from "../services/store";

/**
 * State function that is responsible for displaying correct
 * data and performing expected behavior for ConfirmPopup
 * component.
 * @param {String} message - the message
 * @param {*} onSubmit - function that handles what should
 *                       happen on submission
 */
export const confirmDialog = (message, onSubmit) => {
  useConfirmDialogStore.setState({
    message,
    onSubmit,
  });
};

/**
 * Reusable component that can be used for confirmation dialog.
 * @param {String} header (optional) title of of the confirmation 
 *                        dialog. Default is "Confirm the action"
 * @param {*} children (optional) children components
 * @returns Confirmation popup.
 */
function ConfirmPopup({ header, children }) {
  const { message, onSubmit, close } = useConfirmDialogStore();

  return (
    <Dialog open={Boolean(onSubmit)} onClose={close} maxWidth="xs" fullWidth>
      <DialogTitle variant="h4">
        {header ? header : "Confirm the action"}
      </DialogTitle>
      <Box position="absolute" top={8} right={0}>
        <IconButton sx={{ fontSize: "20px" }} onClick={close}>
          <CloseOutlined />
        </IconButton>
      </Box>
      <DialogContent>
        {!children ? <Typography>{message}</Typography> : children}
      </DialogContent>
      <DialogActions>
        <Button color="primary" variant="contained" onClick={close}>
          Cancel
        </Button>
        <Button
          color="secondary"
          variant="contained"
          onClick={() => {
            if (onSubmit) {
              onSubmit();
            }
            close();
          }}
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ConfirmPopup;
