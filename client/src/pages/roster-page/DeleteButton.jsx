import { useCallback } from "react";
import { GridActionsCellItem } from "@mui/x-data-grid";
import { toast } from "react-toastify";
import ConfirmPopup, { confirmDialog } from "../../components/ConfirmPopup";
import { useAccountStore } from "../../services/store";
import DeleteOutlined from "@ant-design/icons/DeleteOutlined";

function DeleteButton(props) {
  const { courseId, rows, token, params } = props;

  const deleteUser = useCallback(
    (id) => () => {
      //setRows((prevRows) => prevRows.filter((row) => row.id !== id));
      toast.success("Deleted user");
    },
    [courseId, token]
  );

  const isButtonDisabled = () => {
    // Return true if member is the current user
    // Or if member is an instructor and user is not an instructor
    const userId = useAccountStore((state) => state.id);
    const instructorIds = rows.instructors?.map((user) => user.id);
    const isMemberInstructor = instructorIds?.indexOf(userId) !== -1;
    return !isMemberInstructor;
  };

  return (
    <>
      <GridActionsCellItem
        icon={<DeleteOutlined />}
        onClick={() => {
          confirmDialog(
            "Do you want to delete this user",
            deleteUser(params.id)
          );
        }}
        disabled={isButtonDisabled()}
        label="Delete"
      />
      <ConfirmPopup />
    </>
  );
}

export default DeleteButton;
