import Typography from "@mui/material/Typography";
import RosterTabs from "./RosterTabs";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import useTheme from "@mui/material/styles/useTheme";
import useQueryUsers from "../../hooks/useQueryUsers";

/**
 * A component that represents the roster page that the user visits
 * after clicking the people icon in the nav drawer.
 * @returns The Roster component.
 */
const Roster = () => {
  const theme = useTheme();

  const { isLoading, error, data } = useQueryUsers();

  if (isLoading) {
    return (
      <Alert severity="warning" sx={{ mt: theme.spacing(2) }}>
        Loading roster ...
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
      <Typography variant="h4" sx={{ marginBottom: 2.25 }}>
        Roster
      </Typography>
      <RosterTabs rows={data} />
    </>
  );
};

export default Roster;
