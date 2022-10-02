import { GridActionsCellItem } from "@mui/x-data-grid";
import ConfirmPopup, { confirmDialog } from "../../components/ConfirmPopup";
import DeleteOutlined from "@ant-design/icons/DeleteOutlined";
import { useStoreToken } from "../../services/store";
import { decodeToken } from "react-jwt";
import useMutationRemoveUser from "../../hooks/useMutationRemoveUser";

function DeleteButton(props) {
  const { rows, params, isStaff } = props;

  const { mutate } = useMutationRemoveUser(params.id, isStaff);

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
