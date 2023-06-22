import Fab from "@mui/material/Fab";
import SpeedDialIcon from "@mui/material/SpeedDialIcon";
import Alert from "@mui/material/Alert";
import Grid from "@mui/material/Grid";
import NiceModal from "@ebay/nice-modal-react";
import Topic from "../topics/Topic";
import Typography from "@mui/material/Typography";
import useQueryTopics from "../../hooks/useQueryTopics";
import useStoreLayout from "../../hooks/useStoreLayout";

function Agenda() {
  const { isLoading, error, data } = useQueryTopics(); // TODO: CHANGE THIS LATER FOR LECTURE TOPICS
  const courseType = useStoreLayout((state) => state.courseType);

  if (isLoading) {
    return <Alert severity="warning">Retrieving lecture topics ...</Alert>;
  }

  if (error) {
    return <Alert severity="error">Unable to retrieve lecture topics</Alert>;
  }

  // TODO: CHANGE LATER FOR LECTURE TOPICS
  return (
    <>
      <Typography variant="h4" sx={{ marginBottom: 2.25 }}>
        Agenda
      </Typography>
      {data.length !== 0 && (
        <Grid container spacing={2}>
          {data.map((topic) => {
            return (
              <Grid item xs={12} key={topic.id}>
                <Topic topic={topic} />
              </Grid>
            );
          })}
        </Grid>
      )}
      {courseType === "Instructor" && (
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

export default Agenda;
