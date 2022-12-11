import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import AuthCard from "./AuthCard";
import { Alert, AlertTitle } from "@mui/material";

function AuthWrapper({ children }) {
  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "background.paper" }}>
      <Grid
        container
        direction="column"
        justifyContent="flex-end"
        sx={{
          minHeight: "100vh",
        }}
      >
        <Grid item xs={12}>
          <Grid
            item
            xs={12}
            container
            justifyContent="center"
            alignItems="center"
            sx={{
              minHeight: "100vh",
            }}
          >
            <Grid item>
              <Typography
                fontSize="30px"
                fontWeight={400}
                sx={{ marginLeft: 1.5 }}
              >
                Hourly
              </Typography>
              <AuthCard>{children}</AuthCard>
              <Alert severity="warning" sx={{ marginLeft: 1.5 }}>
                <AlertTitle>Sign in option</AlertTitle>
                Use JHU SSO sign in unless directed otherwise by admin.
              </Alert>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}

export default AuthWrapper;

AuthWrapper.propTypes = {
  children: PropTypes.node,
};
