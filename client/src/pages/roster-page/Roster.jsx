import { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import Stack from "@mui/material/Stack";
import InviteUser from "./InviteUser";
import Typography from "@mui/material/Typography";
import RosterTabs from "./RosterTabs";
import DeleteButton from "./DeleteButton";
import { useQuery } from "react-query";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import useTheme from "@mui/material/styles/useTheme";
import { fetchUsers } from "../../utils/requests";
// ==============================|| Roster ||============================== //

/**
 * A component that represents the roster page that the user visits after clicking the people icon in the nav drawer.
 * @returns The Roster component.
 */
const Roster = () => {
  //delete it and use currenCourse.id instead
  const [courseId, setCourseId] = useState();
  const [value, setValue] = useState(0);
  const [check, setCheck] = useState(1);
  const token = 2;
  const theme = useTheme();


  const { isLoading, error, data } = useQuery(["users"], fetchUsers);

  if (isLoading) {
    return (
      <Alert severity="warning" sx={{ mt: theme.spacing(2) }}>
        <AlertTitle>Loading roster ...</AlertTitle>
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
  

  const deleteUser = () => {
    // (id) => () => {
    //   axios
    //     .delete(`/api/courses/${courseId}/roster/${id}`, {
    //       headers: { Authorization: `Bearer ${token}` },
    //     })
    //     .then(() => {
    //       //setRows((prevRows) => prevRows.filter((row) => row.id !== id));
    //     })
    //     .catch((err) => {});
    // },
    // [courseId, token]

    //TODO add the delete user finctionality
  }

 

  return (
    <>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h4">Roster</Typography>
        <InviteUser preSelect={check} key={check} />
      </Stack>
      <RosterTabs
        rows={data}
        setCheck={setCheck}
        key={check}
        check={check}
        value={value}
        setValue={setValue}
        deleteUser = {deleteUser()}
      />
    </>
  );
};

export default Roster;