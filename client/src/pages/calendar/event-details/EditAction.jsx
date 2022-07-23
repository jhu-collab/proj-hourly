import EditOutlined from "@ant-design/icons/EditOutlined";
import IconButton from "@mui/material/IconButton";
import { useState } from "react";
import { useEditEventPopupStore } from "../../../services/store";
import UpsertEvent from "../upsert-event/UpsertEvent";

/**
 * Represents the Edit IconButton on the EventDetails component
 * and the associated ConfirmPopup component.
 * @param {*} handlePopoverClose - closes EventDetails popover
 * @returns Edit action button and popup.
 */
function EditAction({ handlePopoverClose }) {
  const [openPopup, setOpenPopup] = useState(false);

  const { open, togglePopup } = useEditEventPopupStore();

  const handlePopupToggle = () => {
    open === true && handlePopoverClose();
    setOpenPopup(!open);
    togglePopup(!open);
  };

  return (
    <>
      <IconButton sx={{ fontSize: "20px" }} onClick={handlePopupToggle}>
        <EditOutlined />
      </IconButton>
      <UpsertEvent
        open={openPopup}
        handlePopupToggle={handlePopupToggle}
        type="edit"
      />
    </>
  );
}

export default EditAction;
