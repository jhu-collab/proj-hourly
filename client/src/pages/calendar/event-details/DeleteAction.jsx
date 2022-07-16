import DeleteOutlined from "@ant-design/icons/DeleteOutlined";
import { IconButton } from "@mui/material";
import { useState } from "react";
import ConfirmPopup, { confirmDialog } from "../../../components/ConfirmPopup";

function DeleteAction() {
  const [open, setOpen] = useState(false);

  const handlePopupToggle = () => {
    setOpen(!open);
  };

  return (
    <>
      <IconButton
        sx={{ fontSize: "20px" }}
        onClick={() => {
          confirmDialog("Do you really want to delete all the data?", () =>
            console.log("deleting all the data!")
          );
        }}
      >
        <DeleteOutlined />
      </IconButton>
      <ConfirmPopup open={open} onClose={handlePopupToggle} />
    </>
  );
}

export default DeleteAction;
