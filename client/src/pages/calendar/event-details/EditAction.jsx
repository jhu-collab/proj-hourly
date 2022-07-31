import EditOutlined from "@ant-design/icons/EditOutlined";
import IconButton from "@mui/material/IconButton";
import NiceModal from "@ebay/nice-modal-react";

/**
 * Represents the Edit IconButton on the EventPopover component
 * and the associated ConfirmPopup component.
 * @returns Edit action button and popup.
 */
function EditAction() {
  return (
    <>
      <IconButton
        sx={{ fontSize: "20px" }}
        onClick={() => NiceModal.show("upsert-event", { type: "edit" })}
      >
        <EditOutlined />
      </IconButton>
    </>
  );
}

export default EditAction;
