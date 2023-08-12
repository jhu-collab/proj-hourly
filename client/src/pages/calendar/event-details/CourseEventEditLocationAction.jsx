import IconButton from "@mui/material/IconButton";
import CompassOutlined from "@ant-design/icons/CompassOutlined";
import NiceModal from "@ebay/nice-modal-react";

/**
 * Represents the Edit Location IconButton on the EventPopover component
 * and the associated ConfirmPopup component.
 * @returns Course event edit location action button and popup.
 */
function CourseEventEditLocationAction() {
  return (
    <>
      <IconButton
        sx={{ fontSize: "20px" }}
        onClick={() =>
          NiceModal.show("upsert-event", { type: "courseLocation" })
        }
      >
        <CompassOutlined />
      </IconButton>
    </>
  );
}

export default CourseEventEditLocationAction;
