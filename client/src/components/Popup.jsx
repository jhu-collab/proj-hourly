import { CloseOutlined } from "@ant-design/icons";
import { Dialog, DialogContent, Grid, IconButton } from "@mui/material";
import React from "react";

/**
 * Reusable MUI Dialog component. The popup has an clear icon
 * attached by default.
 * @param {boolean} open (required) state variable that determines whether the popup
 *                  is opened
 *  @param {*} onClose: (required) function that handles what happens when popup
 *             is closed
 * @param {*} children: (optional) children to fill up the component
 * @returns Reusable popup component.
 */
function Popup({ open, onClose, children }) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent>
        <Grid container direction="column">
          <Grid item container xs={12} justifyContent="flex-end" sx={{ ml: 2 }}>
            <IconButton onClick={onClose} sx={{ fontSize: "25px" }}>
              <CloseOutlined />
            </IconButton>
          </Grid>
          <Grid item>{children}</Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
}

export default Popup;
