import { Button, Grid } from "@mui/material";
import { toast } from "react-toastify";

function ReactToastifyDemo() {
  return (
    <Grid container columnSpacing={2}>
      <Grid item>
        <Button
          variant="contained"
          color="inherit"
          onClick={() => toast("Default toast!")}
        >
          Default
        </Button>
      </Grid>
      <Grid item>
        <Button
          variant="contained"
          color="info"
          onClick={() => toast.info("Info toast!")}
        >
          Info
        </Button>
      </Grid>
      <Grid item>
        <Button
          variant="contained"
          color="success"
          onClick={() => toast.success("Success toast!")}
        >
          Success
        </Button>
      </Grid>
      <Grid item>
        <Button
          variant="contained"
          color="warning"
          onClick={() => toast.warning("Warning toast!")}
        >
          Warning
        </Button>
      </Grid>
      <Grid item>
        <Button
          variant="contained"
          color="error"
          onClick={() => toast.error("Error toast!")}
        >
          Error
        </Button>
      </Grid>
    </Grid>
  );
}

export default ReactToastifyDemo;
