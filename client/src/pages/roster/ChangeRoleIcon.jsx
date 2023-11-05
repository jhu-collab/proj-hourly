import NiceModal from "@ebay/nice-modal-react";
import { GridActionsCellItem } from "@mui/x-data-grid";
import UserSwitchOutlined from "@ant-design/icons/UserSwitchOutlined";
import useStoreLayout from "../../hooks/useStoreLayout";

function ChangeRoleIcon(props) {
  const { params, isStaff } = props;
  const courseType = useStoreLayout((state) => state.courseType);

  return (
    <>
      <GridActionsCellItem
        data-cy="change-role-icon"
        icon={<UserSwitchOutlined />}
        onClick={() => {
          NiceModal.show("change-user-role", {
            params: params,
            isStaff: isStaff,
          });
        }}
        disabled={courseType !== "Instructor"}
        label="Change Role"
        size="large"
      />
    </>
  );
}

export default ChangeRoleIcon;
