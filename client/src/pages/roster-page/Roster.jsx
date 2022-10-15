import { useState } from "react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import RosterTabs from "./RosterTabs";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import useTheme from "@mui/material/styles/useTheme";
import NiceModal from "@ebay/nice-modal-react";
import Button from "@mui/material/Button";
import useQueryUsers from "../../hooks/useQueryUsers";

/**
 * A component that represents the roster page that the user visits
 * after clicking the people icon in the nav drawer.
 * @returns The Roster component.
 */
const Roster = () => {
  //TODO: delete it and use currenCourse.id instead
  const [value, setValue] = useState(0);
  const theme = useTheme();

  const { isLoading, error, data } = useQueryUsers();

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
        <Button
          sx={{ margin: 0, fontSize: 17, justifyContent: "flex-end" }}
          onClick={() => NiceModal.show("promote-user", { isInstructor: true })}
          variant="contained"
        >
          Promote Users
        </Button>
      </Stack>
      <RosterTabs rows={data} value={value} setValue={setValue} />
    </>
  );
};

export default Roster;
