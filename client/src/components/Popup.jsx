import CloseOutlined from "@ant-design/icons/CloseOutlined";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";

/**
 * Reusable MUI Dialog component. The popup has an clear icon
 * attached by default.
 * @param {*} modal (required) object that handles that state
 *                       of the popup component (object returned from
 *                       useModal hook from @ebay/nice-modal-react)
 * @param {string} title (optional) the title of the popup
 * @param {*} children (optional) children to fill up the component
 * @returns Reusable popup component.
 */
function Popup({ modal, title, children, width }) {
  return (
    <Dialog
      fullWidth
      maxWidth={!width ? "xs" : width}
      open={modal.visible}
      onClose={modal.hide}
    >
      {title && (
        <DialogTitle align="center" variant="h2" sx={{ mb: -2, mt: 2 }}>
          {title}
        </DialogTitle>
      )}
      <Box position="absolute" top={2} right={2}>
        <IconButton sx={{ fontSize: "16px" }} onClick={modal.hide}>
          <CloseOutlined />
        </IconButton>
      </Box>
      <DialogContent>{children}</DialogContent>
    </Dialog>
  );
}

export default Popup;
