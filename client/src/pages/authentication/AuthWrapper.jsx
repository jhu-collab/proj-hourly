import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import AuthCard from "./AuthCard";

function AuthWrapper({ children }) {
  return (
    <Box sx={{ minHeight: "100vh" }}>
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
              minHeight: {
                xs: "calc(100vh - 134px)",
                md: "calc(100vh - 112px)",
              },
            }}
          >
            <Grid item>
              <AuthCard>{children}</AuthCard>
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
