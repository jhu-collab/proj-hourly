import Fab from "@mui/material/Fab";
import SpeedDialIcon from "@mui/material/SpeedDialIcon";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Grid from "@mui/material/Grid";
import NiceModal from "@ebay/nice-modal-react";
import Topic from "./Topic";
import Typography from "@mui/material/Typography";
import useQueryMyRole from "../../hooks/useQueryMyRole";
import Loader from "../../components/Loader";
import useQueryTopics from "../../hooks/useQueryTopics";

/**
 * Represents the Topics page.
 * @returns Topics page
 */
function Topics() {
  const { isLoading, error, data } = useQueryTopics();
  const { isLoading: isLoadingRole, data: dataRole } = useQueryMyRole();

  const noRegistrations = () => {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        <AlertTitle>No Topics</AlertTitle>
      </Alert>
    );
  };

  if (isLoading) {
    return <Alert severity="warning">Retrieving topics ...</Alert>;
  }

  if (isLoadingRole) {
    return <Loader />;
  }

  if (error) {
    return <Alert severity="error">Unable to retrieve topics</Alert>;
  }

  console.log(data);

  return (
    <>
      <Typography variant="h4">Topics</Typography>
      {data.length === 0 ? (
        noRegistrations()
      ) : (
        <Grid container spacing={2} marginTop={1}>
          {data.map((topic) => {
            return (
              <Grid item xs={12} key={topic.id}>
                <Topic topic={topic} />
              </Grid>
            );
          })}
        </Grid>
      )}
      {dataRole.role === "Instructor" && (
        <Fab
          color="primary"
          onClick={() => NiceModal.show("create-topic")}
          sx={{
            position: "fixed",
            bottom: (theme) => theme.spacing(3),
            right: (theme) => theme.spacing(3),
          }}
        >
          <SpeedDialIcon />
        </Fab>
      )}
    </>
  );
}

export default Topics;
