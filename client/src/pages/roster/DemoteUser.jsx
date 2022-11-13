import { GridActionsCellItem } from "@mui/x-data-grid";
import UserSwitchOutlined from "@ant-design/icons/UserSwitchOutlined";
import { decodeToken } from "react-jwt";
import useStoreToken from "../../hooks/useStoreToken";
import ConfirmPopup, { confirmDialog } from "../../components/ConfirmPopup";
import useMutationDemoteUser from "../../hooks/useMutationDemoteUser";
function DemoteUser(props) {
  const { rows, params} = props;
  const isButtonDisabled = () => {
    // Return true if member is the current user
    // Or if member is an instructor and user is not an instructor
    const token = useStoreToken((state) => state.token);
    const { id } = decodeToken(token);
    const instructorIds = rows.instructors?.map((user) => user.id);
    const isMemberInstructor = instructorIds?.indexOf(id) !== -1;
    return !isMemberInstructor;
  };

  const { mutate } = useMutationDemoteUser(params, "Student");
  console.log(params);
  return (
    <>
      <GridActionsCellItem
        icon={<UserSwitchOutlined />}
        onClick={() => {
            confirmDialog(`Do you want to change ${params.row.firstName} ${params.row.lastName} to Student`, () => {
                mutate();
              });
        }}
        disabled={isButtonDisabled()}
        label="Demote"
      />
      <ConfirmPopup />
    </>
  );
}

export default DemoteUser;
