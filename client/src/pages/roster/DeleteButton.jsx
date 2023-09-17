import { GridActionsCellItem } from "@mui/x-data-grid";
import ConfirmPopup, { confirmDialog } from "../../components/ConfirmPopup";
import CloseOutlined from "@ant-design/icons/CloseOutlined";
import useMutationRemoveUser from "../../hooks/useMutationRemoveUser";
import useStoreLayout from "../../hooks/useStoreLayout";

/**
 * Delete button for each row of Roster grid
 * @param {*} params list of params for the selected row
 * @param {Boolean} isStaff whether or not the selected user is staff
 * @returns Delete action button for each row of Roster grid
 */
function DeleteButton({ params, isStaff }) {
  const { mutate } = useMutationRemoveUser(params.id, isStaff);
  const courseType = useStoreLayout((state) => state.courseType);

  return (
    <>
      <GridActionsCellItem 
      data-cy="delete-user-button"
        icon={<CloseOutlined />}
        onClick={() => {
          confirmDialog("Do you want to delete this user", () => {
            mutate();
          });
        }}
        disabled={courseType !== "Instructor"}
        label="Delete"
        size="large"
      />
      <ConfirmPopup data-cy="delete-user-confirmation-button"/>
    </>
  );
}

export default DeleteButton;
