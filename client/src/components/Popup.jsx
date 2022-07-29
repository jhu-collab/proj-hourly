import CloseOutlined from "@ant-design/icons/CloseOutlined";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import React from "react";
import { bindDialog } from "material-ui-popup-state/hooks";

/**
 * Reusable MUI Dialog component. The popup has an clear icon
 * attached by default.
 * @param {*} popupState (required) object that handles that state
 *                       of the popup component (object returned from
 *                       usePopupState hook from material-ui-popup-state)
 * @param {string} title (optional) the title of the popup
 * @param {*} children (optional) children to fill up the component
 * @returns Reusable popup component.
 */
function Popup({ popupState, title, children }) {
  return (
    <Dialog fullWidth maxWidth="xs" {...bindDialog(popupState)}>
      {title && (
        <DialogTitle align="center" variant="h2" sx={{ mb: -2, mt: 2 }}>
          {title}
        </DialogTitle>
      )}
      <Box position="absolute" top={2} right={2}>
        <IconButton sx={{ fontSize: "22px" }} onClick={popupState.close}>
          <CloseOutlined />
        </IconButton>
      </Box>
      <DialogContent>{children}</DialogContent>
    </Dialog>
  );
}

export default Popup;
