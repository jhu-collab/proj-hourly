import Grid from "@mui/material/Grid";

function NotFound() {
  return (
    <Grid container direction="column" alignItems="center">
      <Grid item>
        <img src="https://i.imgur.com/qIufhof.png" alt={"not found"} />
      </Grid>
      <Grid item>
        <h1>This page could not be found</h1>
      </Grid>
    </Grid>
  );
}

export default NotFound;
