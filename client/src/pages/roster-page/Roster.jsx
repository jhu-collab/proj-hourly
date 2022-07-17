import { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import Stack from '@mui/material/Stack'
import InviteUser from './InviteUser';
import * as React from 'react';
import Typography from '@mui/material/Typography';
import RosterTabs from './RosterTabs';
import DeleteButton from './DeleteButton';
import { useQuery } from "react-query";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import useTheme from "@mui/material/styles/useTheme";
import fetchUsers from './fetchUsers';


// ==============================|| Roster ||============================== //

/**
 * A component that represents the roster page that the user visits after clicking the people icon in the nav drawer.
 * @returns The Roster component.
 */
const Roster = ({ user, token}) => {
  const [rows, setRows] = useState([]);
  // eslint-disable-next-line
  const [users, setUsers] = useState({});
  // eslint-disable-next-line
  const [courseId, setCourseId] = useState();
  const [isInstructor, setIsInstructor] = useState(false);
  const [value, setValue] = React.useState(0);
  const [check, setCheck] = React.useState(1);

  const theme = useTheme();

  //TODO set the courseId


  const { isLoading, error, data } = useQuery(["users"], fetchUsers);

  if (isLoading) {
    return (
      <Alert severity="warning" sx={{ mt: theme.spacing(2) }}>
        <AlertTitle>Loading courses ...</AlertTitle>
      </Alert>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: theme.spacing(2) }}>
        <AlertTitle>Error</AlertTitle>
        {"An error has occurred: " + error.message}
      </Alert>
    );
  }

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
    (id) => () => {
      axios
        .delete(`/api/courses/${courseId}/roster/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(() => {
          setRows((prevRows) => prevRows.filter((row) => row.id !== id));
        })
        .catch((err) => {});
    },
    [courseId, token],
  );

  

  // Get the roster of the current course id
  useEffect(() => {
    if (courseId) {
      fetchUsers(courseId, token, setUsers);
    }
  }, [courseId, token]);




  useEffect(() => {
          const newRoster = [];
          ['instructors', 'staff', 'students'].forEach((type) => {
                res.data[type].map((item) => {
                const newMember = {
                  role: {
                    instructors: 'Instructor',
                    staff: 'Staff',
                    students: 'Student',
                  }[type],
                  id: item.accountid,
                  ...item,
                };
                newRoster.push(newMember);
              })
          });
          setRows(newRoster);
        } , [users, courseId, token]);


  const columns = useMemo(() => {
    const isButtonDisabled = (id) => {
      // Return true if member is the current user
      // Or if member is an instructor and user is not an instructor
      const isSelf = id === user.accountid;
      const instructorIds = users.instructors?.map((user) => user.accountid);
      const isMemberInstructor = instructorIds?.indexOf(id) !== -1;

      return isSelf || (isMemberInstructor && !isInstructor);
    };

    return [
      {
        field: 'username',
        headerName: 'Username',
        flex: 4,
        
      },
      {
        field: 'email',
        headerName: 'Email',
        flex: 4,
      },
      {
        field: 'role',
        headerName: 'Role',
        flex: 4,
      },
      {
        field: 'actions',
        type: 'actions',
        flex: 1,
        getActions: (params) => [
          <DeleteButton 
          setRows = {setRows}
          courseId = {courseId}
          token = {token}
          params = {params}
          isButtonDisabled = {isButtonDisabled}
          />
        ],
      },
    ];
  }, [deleteUser, isInstructor, users.instructors, user]);

  
  return (
    <>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h4">Roster</Typography>
        <InviteUser preSelect={check} key = {check}/>
      </Stack>
      <RosterTabs columns = {columns} 
      rows = {rows} setCheck = {setCheck} 
      key = {check} check = {check}
      value = {value} setValue = {setValue}/>
    </>
  );
};


export default Roster;
