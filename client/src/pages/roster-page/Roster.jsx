import { useState } from "react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import RosterTabs from "./RosterTabs";
import { useQuery } from "react-query";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import useTheme from "@mui/material/styles/useTheme";
import { fetchUsers } from "../../utils/requests";
import { useCourseStore } from "../../services/store";
import NiceModal from "@ebay/nice-modal-react";
import { Button } from "@mui/material";
// ==============================|| Roster ||============================== //

/**
 * A component that represents the roster page that the user visits after clicking the people icon in the nav drawer.
 * @returns The Roster component.
 */
const Roster = () => {
  //delete it and use currenCourse.id instead
  const [value, setValue] = useState(0);
  const theme = useTheme();

  const course = useCourseStore((state) => state.course);

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
  };

  return (
    <>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h4">Roster</Typography>
        <Button
          sx={{ margin: 0, fontSize: 17, justifyContent: "flex-end" }}
          onClick={() => NiceModal.show("invite-user", { isInstructor: true })}
          variant="contained"
        >
          Invite User
        </Button>
      </Stack>
      <RosterTabs
        rows={data}
        value={value}
        setValue={setValue}
        deleteUser={deleteUser}
      />
    </>
  );
};

export default Roster;
