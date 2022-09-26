import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import AuthLogin from "./AuthLogin";
import AuthWrapper from "./AuthWrapper";

function Login() {
  return (
    <AuthWrapper>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h3">Login</Typography>
        </Grid>
        <Grid item xs={12}>
          <AuthLogin />
        </Grid>
      </Grid>
    </AuthWrapper>
  );
}

export default Login;
