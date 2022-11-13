import { GridActionsCellItem } from "@mui/x-data-grid";
import UserSwitchOutlined from "@ant-design/icons/UserSwitchOutlined";
import { decodeToken } from "react-jwt";
import useStoreToken from "../../hooks/useStoreToken";
import PromoteStudentPopup from "./PromoteStudentPopup";
import { useState } from "react";

function ChangeRole(props) {
  const { rows, params} = props;
    const [open, setOpen] = useState(false);
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
           setOpen(true);
        }}
        disabled={isButtonDisabled()}
        label="Promote"
      />
      <PromoteStudentPopup params={params} open={open} setOpen={setOpen}/>
    </>
  );
}

export default ChangeRole;
