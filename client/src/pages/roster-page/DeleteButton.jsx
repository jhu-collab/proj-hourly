import { useCallback } from "react";
import { GridActionsCellItem } from "@mui/x-data-grid";
import { toast } from "react-toastify";
import ConfirmPopup, { confirmDialog } from "../../components/ConfirmPopup";
import { DeleteOutlined } from "@ant-design/icons";

function DeleteButton(props) {
  const { courseId, setRows, token, params, isButtonDisabled } = props;

  const deleteUser = useCallback(
    (id) => () => {
      setRows((prevRows) => prevRows.filter((row) => row.id !== id));
      toast.success("Deleted user");
    },
    [courseId, token]
  );

  return (
    <>
      <GridActionsCellItem
        icon={<DeleteOutlined style={{ fontSize: 20 }} />}
        onClick={() => {
          confirmDialog(
            "Do you want to delete this user",
            deleteUser(params.id)
          );
        }}
        disabled={isButtonDisabled(params.id)}
        label="Delete"
      />
      <ConfirmPopup />
    </>
  );
}

export default DeleteButton;
