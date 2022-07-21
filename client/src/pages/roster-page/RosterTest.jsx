import { useState, useEffect, useMemo, useCallback } from "react";
import Stack from "@mui/material/Stack";
import InviteUser from "./InviteUser";
import * as React from "react";
import Typography from "@mui/material/Typography";
import RosterTabs from "./RosterTabs";
import { fetchUsers } from "../../utils/requests";
import Foo from "./Foo";
import DeleteButton from "./DeleteButton";
// ==============================|| Roster ||============================== //

/**
 * A component that represents the roster page that the user visits after clicking the people icon in the nav drawer.
 * @returns The Roster component.
 */
const RosterTest = ({ user, token }) => {
  const [rows, setRows] = useState([]);
  // eslint-disable-next-line
  const [users, setUsers] = useState({});
  // eslint-disable-next-line
  const [courseId, setCourseId] = useState();
  const [isInstructor, setIsInstructor] = useState(false);
  const [value, setValue] = React.useState(0);
  const [check, setCheck] = React.useState(1);

  // Check if current user is an instructor
  useEffect(() => {
    const isUserIdInInstructors = (id) => {
      return users.instructors.some((item) => {
        return item.accountid === id;
      });
    };

    if (users.instructors) {
      setIsInstructor(isUserIdInInstructors(user.accountid));
    }
  }, [user, users]);

  const deleteUser = useCallback(
    //need to upadte the data
    (id) => () => {
      setRows((prevRows) => prevRows.filter((row) => row.id !== id));
    },
    [courseId, token]
  );
  // Get the roster of the current course id
  useEffect(() => {
    if (courseId) {
      fetchUsers(courseId, token, setUsers);
    }
  }, [courseId, token]);

  useEffect(() => {
    //need to feetch the data instead of using fake data
    const newRoster = [];
    ["instructors", "staff", "students"].forEach((type) => {
      Foo[type].map((item) => {
        const newMember = {
          role: {
            instructors: "Instructor",
            staff: "Staff",
            students: "Student",
          }[type],
          id: item.accountid,
          ...item,
        };
        newRoster.push(newMember);
      });
    });
    setRows(newRoster);
  }, []);

  const columns = useMemo(() => {
    const isButtonDisabled = (id) => {
      // Return true if member is the current user
      // Or if member is an instructor and user is not an instructor
      // const isSelf = id === user.accountid;
      const instructorIds = users.instructors?.map((user) => user.accountid);
      const isMemberInstructor = instructorIds?.indexOf(id) !== -1;

      //return isSelf || (isMemberInstructor && !isInstructor);
      return false;
    };

    return [
      {
        field: "username",
        headerName: "Username",
        flex: 4,
      },
      {
        field: "email",
        headerName: "Email",
        flex: 4,
      },
      {
        field: "role",
        headerName: "Role",
        flex: 4,
      },
      {
        field: "actions",
        type: "actions",
        flex: 1,
        getActions: (params) => [
          <DeleteButton
            setRows={setRows}
            courseId={courseId}
            token={token}
            params={params}
            isButtonDisabled={isButtonDisabled}
          />,
        ],
      },
    ];
  }, [deleteUser, isInstructor, users.instructors, user]);

  return (
    <>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h4">Roster</Typography>
        <InviteUser preSelect={check} key={check} />
      </Stack>
      <RosterTabs
        columns={columns}
        rows={rows}
        setCheck={setCheck}
        key={check}
        check={check}
        value={value}
        setValue={setValue}
      />
    </>
  );
};

export default RosterTest;
