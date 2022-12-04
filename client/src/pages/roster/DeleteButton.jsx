import { GridActionsCellItem } from "@mui/x-data-grid";
import ConfirmPopup, { confirmDialog } from "../../components/ConfirmPopup";
import CloseOutlined from "@ant-design/icons/CloseOutlined";
import useMutationRemoveUser from "../../hooks/useMutationRemoveUser";
import useQueryMyRole from "../../hooks/useQueryMyRole";

/**
 * Delete button for each row of Roster grid
 * @param {*} params list of params for the selected row
 * @param {Boolean} isStaff whether or not the selected user is staff
 * @returns Delete action button for each row of Roster grid
 */
function DeleteButton({ params, isStaff }) {
  const { mutate } = useMutationRemoveUser(params.id, isStaff);
  const { data } = useQueryMyRole();

  return (
    <>
      <GridActionsCellItem
        icon={<CloseOutlined />}
        onClick={() => {
          confirmDialog("Do you want to delete this user", () => {
            mutate();
          });
        }}
        disabled={data?.role !== "Instructor"}
        label="Delete"
        size="large"
      />
      <ConfirmPopup />
    </>
  );
}

export default DeleteButton;
