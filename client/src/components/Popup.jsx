import { CloseOutlined } from "@ant-design/icons";
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Typography,
  useTheme,
} from "@mui/material";
import React from "react";

/**
 * Reusable MUI Dialog component. The popup has an clear icon
 * attached by default.
 * @param {boolean} open (required) state variable that determines whether the popup
 *                  is opened
 * @param {*} onClose: (required) function that handles what happens when popup
 *             is closed
 * @param {string} title: (required) the title of the popup
 * @param {*} children: (optional) children to fill up the component
 * @returns Reusable popup component.
 */
function Popup({ open, onClose, title, children }) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{mb: -2, mt: 2}}>
        <Typography variant="h2" align="center">{title}</Typography>
      </DialogTitle>
      <Box position="absolute" top={2} right={2}>
        <IconButton sx={{fontSize: "22px"}} onClick={onClose}>
          <CloseOutlined />
        </IconButton>
      </Box>
      <DialogContent>{children}</DialogContent>
    </Dialog>
  );
}

export default Popup;
