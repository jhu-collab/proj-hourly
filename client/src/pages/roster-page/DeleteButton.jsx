import { useState, useCallback } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import { GridActionsCellItem } from "@mui/x-data-grid";
import Popup from "../../components/Popup";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { toast } from "react-toastify";

function DeleteButton(props) {
  const { courseId, setRows, token, params, isButtonDisabled } = props;

  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
    console.log(open);
  };

  const handleClose = () => {
    //need to fetch users here
    setOpen(false);
  };

  const deleteUser = useCallback(
    (id) => () => {
      setRows((prevRows) => prevRows.filter((row) => row.id !== id));
      toast.success("Deleted user");
    },
    [courseId, token]
  );

  function DeleteUser({ open, handlePopupToggle, id }) {
    return (
      <Popup
        open={open}
        onClose={handlePopupToggle}
        title="Do you want to delete the user?"
      >
        <Box textAlign="center">
          <Button
            onClick={deleteUser(id)}
            sx={{ margin: 0, fontSize: 17 }}
            variant="contained"
          >
            Delete User
          </Button>
        </Box>
      </Popup>
    );
  }

  return (
    <>
      <GridActionsCellItem
        icon={<DeleteIcon />}
        onClick={handleOpen}
        disabled={isButtonDisabled(params.id)}
        label="Delete"
      />
      <DeleteUser open={open} onClose={handleClose} id={params.id} />
    </>
  );
}

export default DeleteButton;
