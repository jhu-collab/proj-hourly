import NiceModal from "@ebay/nice-modal-react";
import { GridActionsCellItem } from "@mui/x-data-grid";
import { decodeToken } from "react-jwt";
import useStoreToken from "../../hooks/useStoreToken";
import UserSwitchOutlined from "@ant-design/icons/UserSwitchOutlined";
function PromoteIcon(props) {
  const { params, isStaff } = props;
  return (
    <>
      <GridActionsCellItem
        icon={<UserSwitchOutlined />}
        onClick={() => {
          NiceModal.show("promote-user", { params: params, isStaff: isStaff });
        }}
        label="Promote"
        size="large"
      />
    </>
  );
}

export default PromoteIcon;
