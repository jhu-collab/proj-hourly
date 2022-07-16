import DeleteOutlined from "@ant-design/icons/DeleteOutlined";
import { IconButton } from "@mui/material";
import { useState } from "react";
import ConfirmActionDialog from "../../../components/ConfirmActionDialog";

function DeleteAction() {
  const [open, setOpen] = useState(false);

  const handlePopupToggle = () => {
    setOpen(!open);
  };

  return (
    <>
      <IconButton sx={{ fontSize: "20px" }} onClick={handlePopupToggle}>
        <DeleteOutlined />
      </IconButton>
      <ConfirmActionDialog open={open} onClose={handlePopupToggle} />
    </>
  );
}

export default DeleteAction;
