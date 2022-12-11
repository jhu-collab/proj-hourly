import NiceModal from "@ebay/nice-modal-react";
import { GridActionsCellItem } from "@mui/x-data-grid";
import UserSwitchOutlined from "@ant-design/icons/UserSwitchOutlined";
function ChangeRoleIcon(props) {
  const { params, isStaff } = props;
  return (
    <>
      <GridActionsCellItem
        icon={<UserSwitchOutlined />}
        onClick={() => {
          NiceModal.show("change-user-role", { params: params, isStaff: isStaff });
        }}
        label="Change Role"
        size="large"
      />
    </>
  );
}

export default ChangeRoleIcon;