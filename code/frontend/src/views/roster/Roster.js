import { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import DeleteIcon from '@mui/icons-material/People';

import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import MainCard from 'ui-component/cards/MainCard';
import { Grid } from '@mui/material';
import InviteUser from './InviteUser';
// ==============================|| Roster ||============================== //

/**
 * A component that represents the roster page that the user visits after clicking the people icon in the nav drawer.
 * @returns The Roster component.
 */
const Roster = ({ user, token }) => {
  const [rows, setRows] = useState([]);
  // eslint-disable-next-line
  const [users, setUsers] = useState({});
  // eslint-disable-next-line
  const [courseId, setCourseId] = useState();
  const [isInstructor, setIsInstructor] = useState(false);

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
          <GridActionsCellItem
            icon={<DeleteIcon />}
            onClick={deleteUser(params.id)}
            disabled={isButtonDisabled(params.id)}
            label="Delete"
          />,
        ],
      },
    ];
  }, [deleteUser, isInstructor, users.instructors, user]);

  return (
    <MainCard title="Class Roster" children={<InviteUser />}>
      <Grid container direction="row" justifyContent="flex-start">
        <Grid item md={10} container justifyContent="flex-start">
          <InviteUser />
        </Grid>
      </Grid>
      <Grid container justifyContent="flex-end"></Grid>
      <div style={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          autoPageSize
          sx={{ fontSize: '20px' }}
        />
      </div>
    </MainCard>
  );
};

export default Roster;
