import { GridActionsCellItem } from "@mui/x-data-grid";
import { toast } from "react-toastify";
import ConfirmPopup, { confirmDialog } from "../../components/ConfirmPopup";
import DeleteOutlined from "@ant-design/icons/DeleteOutlined";
import { useMutation, useQueryClient } from "react-query";
import { removeStaffOrStudent } from "../../utils/requests";
import { useStoreToken } from "../../services/store";
import { decodeToken } from "react-jwt";

function DeleteButton(props) {
  const { rows, params, isStaff } = props;
  const queryClient = useQueryClient();

  const { mutate } = useMutation(
    () => removeStaffOrStudent(params.id, isStaff),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["users"]);
        toast.success(`Successfully removed the user`);
      },
      onError: (error) => {
        toast.error("An error has occurred: " + error.message);
      },
    }
  );

  const isButtonDisabled = () => {
    // Return true if member is the current user
    // Or if member is an instructor and user is not an instructor
    const token = useStoreToken((state) => state.token);
    const { id } = decodeToken(token);
    const instructorIds = rows.instructors?.map((user) => user.id);
    const isMemberInstructor = instructorIds?.indexOf(id) !== -1;
    return !isMemberInstructor;
  };

  return (
    <>
      <GridActionsCellItem
        icon={<DeleteOutlined />}
        onClick={() => {
          confirmDialog("Do you want to delete this user", () => {
            mutate();
          });
        }}
        disabled={isButtonDisabled()}
        label="Delete"
      />
      <ConfirmPopup />
    </>
  );
}

export default DeleteButton;
