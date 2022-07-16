import CloseOutlined from "@ant-design/icons/CloseOutlined";
import {
  Box,
  Dialog,
  DialogActions,
  DialogTitle,
  IconButton,
  DialogContent,
  Button,
  Typography,
} from "@mui/material";
import React from "react";
import { useConfirmDialogStore } from "../services/store";

export const confirmDialog = (message, onSubmit) => {
  useConfirmDialogStore.setState({
    message,
    onSubmit,
  });
};

function ConfirmPopup({ open, onClose, title }) {
  const { message, onSubmit, close } = useConfirmDialogStore();

  return (
    <Dialog open={Boolean(onSubmit)} maxWidth="xs" fullWidth>
      <DialogTitle variant="h4">Confirm the action</DialogTitle>
      <Box position="absolute" top={8} right={0}>
        <IconButton sx={{ fontSize: "20px" }} onClick={close}>
          <CloseOutlined />
        </IconButton>
      </Box>
      <DialogContent>
        <Typography>{message}</Typography>
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
