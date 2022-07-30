import { useCallback } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import { GridActionsCellItem } from "@mui/x-data-grid";
import { toast } from "react-toastify";
import ConfirmPopup, { confirmDialog } from "../../components/ConfirmPopup";
import useStore from "../../services/store";

function DeleteButton(props) {
  const { courseId, rows, token, params } = props;


  const deleteUser = useCallback(
    (id) => () => {
      //setRows((prevRows) => prevRows.filter((row) => row.id !== id));
      toast.success("Deleted user");
    },
    [courseId, token]
  );

  // function DeleteUser({ open, handlePopupToggle, id }) {
  //   return (
  //     // <Popup
  //     //   open={open}
  //     //   onClose={handlePopupToggle}
  //     //   title="Do you want to delete the user?"
  //     // >
  //     //   <Box textAlign="center">
  //     //     <Button
  //     //       onClick={deleteUser(id)}
  //     //       sx={{ margin: 0, fontSize: 17 }}
  //     //       variant="contained"
  //     //     >
  //     //       Delete User
  //     //     </Button>
  //     //   </Box>
  //     // </Popup>
  //     //<DeleteUser open={open} onClose={handleClose} id={params.id} />
  //     <ConfirmPopup message="hi" onSubmit={deleteUser}/>
  //   );
  // }

  const isButtonDisabled = () => {
    // Return true if member is the current user
    // Or if member is an instructor and user is not an instructor
    const { userId } = useStore();
    const instructorIds = rows.instructors?.map((user) => user.id);
    const isMemberInstructor = instructorIds?.indexOf(userId) !== -1;
    return !isMemberInstructor;
  };

  return (
    <>
      <GridActionsCellItem
        icon={<DeleteIcon />}
        onClick={() => {confirmDialog("Do you want to delete this user", deleteUser(params.id))}}
        disabled={isButtonDisabled()}
        label="Delete"
      />
      <ConfirmPopup/>
    </>
  );
}

export default DeleteButton;
