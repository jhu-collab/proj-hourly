import NiceModal from "@ebay/nice-modal-react";
import { GridActionsCellItem } from "@mui/x-data-grid";
import { decodeToken } from "react-jwt";
import useStoreToken from "../../hooks/useStoreToken";
import UserSwitchOutlined from "@ant-design/icons/UserSwitchOutlined";
function PromoteIcon(props) {
  const { params, rows, isStaff } = props;
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
        icon={<UserSwitchOutlined />}
        onClick={() => {
          NiceModal.show("promote-user", { params: params, isStaff: isStaff });
        }}
        disabled={isButtonDisabled()}
        label="Promote"
      />
    </>
  );
}

export default PromoteIcon;
