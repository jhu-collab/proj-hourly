import IconButton from "@mui/material/IconButton";
import CompassOutlined from "@ant-design/icons/CompassOutlined";
import NiceModal from "@ebay/nice-modal-react";

function EditLocation() {
  return (
    <>
      <IconButton
        data-cy="edit-location-action-icon"
        sx={{ fontSize: "20px" }}
        onClick={() => NiceModal.show("upsert-event", { type: "location" })}
      >
        <CompassOutlined />
      </IconButton>
    </>
  );
}

export default EditLocation;
