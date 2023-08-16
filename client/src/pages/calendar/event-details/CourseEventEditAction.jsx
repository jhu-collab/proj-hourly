import EditOutlined from "@ant-design/icons/EditOutlined";
import IconButton from "@mui/material/IconButton";
import NiceModal from "@ebay/nice-modal-react";

/**
 * Represents the Edit IconButton on the EventPopover component
 * and the associated ConfirmPopup component.
 * @returns Course event edit action button and popup.
 */
function CourseEventEditAction() {
  return (
    <>
      <IconButton
        sx={{ fontSize: "20px" }}
        onClick={() => NiceModal.show("upsert-event", { type: "courseEdit" })}
      >
        <EditOutlined />
      </IconButton>
    </>
  );
}

export default CourseEventEditAction;