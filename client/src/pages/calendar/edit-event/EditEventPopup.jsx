import Popup from "../../../components/Popup";

function EditEventPopup({ open, handlePopupToggle }) {
  return <Popup open={open} onClose={handlePopupToggle} title="Edit Event"/>;
}

export default EditEventPopup;
