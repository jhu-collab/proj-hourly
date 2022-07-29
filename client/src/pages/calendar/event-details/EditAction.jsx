import EditOutlined from "@ant-design/icons/EditOutlined";
import IconButton from "@mui/material/IconButton";
import UpsertEvent from "../upsert-event/UpsertEvent";

/**
 * Represents the Edit IconButton on the EventPopover component
 * and the associated ConfirmPopup component.
 * @param {*} popupState (required) object that handles that state
 *                       of the popup component (object returned from
 *                       usePopupState hook from material-ui-popup-state)
 * @param {*} onClose - closes EventPopup/MobileEventPopup
 * @returns Edit action button and popup.
 */
function EditAction({ popupState, onClose }) {
  const handleClose = () => {
    onClose();
    popupState.close();
  };

  return (
    <>
      <IconButton sx={{ fontSize: "20px" }} onClick={popupState.open}>
        <EditOutlined />
      </IconButton>
      <UpsertEvent popupState={popupState} type="edit" onClose={handleClose} />
    </>
  );
}

export default EditAction;
