import NiceModal from "@ebay/nice-modal-react";
import { GridActionsCellItem } from "@mui/x-data-grid";
import UserSwitchOutlined from "@ant-design/icons/UserSwitchOutlined";
import useQueryMyRole from "../../hooks/useQueryMyRole";

function ChangeRoleIcon(props) {
  const { params, isStaff } = props;
  const { data } = useQueryMyRole();

  return (
    <>
      <GridActionsCellItem
        icon={<UserSwitchOutlined />}
        onClick={() => {
          NiceModal.show("change-user-role", { params: params, isStaff: isStaff });
        }}
        disabled={data?.role !== "Instructor"}
        label="Change Role"
        size="large"
      />
    </>
  );
}

export default ChangeRoleIcon;