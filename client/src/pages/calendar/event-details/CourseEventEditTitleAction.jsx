import IconButton from "@mui/material/IconButton";
import UnorderedListOutlined from "@ant-design/icons/UnorderedListOutlined"
import NiceModal from "@ebay/nice-modal-react";


/**
 * Represents the Title Location IconButton on the CourseEventPopover component
 * and the associated ConfirmPopup component.
 * @returns Course event edit title action button and popup.
 */
function CourseEventEditTitleAction() {
  return (
    <>
      <IconButton
        sx={{ fontSize: "20px" }}
        onClick={() => NiceModal.show("upsert-event", { type: "courseTitle" })}
      >
        <UnorderedListOutlined />
      </IconButton>
    </>
  );
}

export default CourseEventEditTitleAction;