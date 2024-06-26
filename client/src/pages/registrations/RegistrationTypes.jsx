import useStoreLayout from "../../hooks/useStoreLayout";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Grid from "@mui/material/Grid";
import RegistrationType from "./RegistrationType";
import Fab from "@mui/material/Fab";
import SpeedDialIcon from "@mui/material/SpeedDialIcon";
import NiceModal from "@ebay/nice-modal-react";

/**
 * Represents the tab panel for Registration Type cards.
 * @param {Number} index the index of the panel. Helps decide
 *                    whether the panel should render
 * @param {*} types list of user's registration types
 * @returns RegistrationTypes page
 */
function RegistrationTypes({ index, types, isLoading, error }) {
  const registrationTab = useStoreLayout((state) => state.registrationTab);
  const courseType = useStoreLayout((state) => state.courseType);

  const noRegistrations = () => {
    return (
      <Alert severity="info" sx={{ mt: 4 }}>
        No Registration Types
      </Alert>
    );
  };

  if (isLoading && registrationTab === index) {
    return (
      <Alert severity="warning" sx={{ mt: 2 }}>
        Loading registrations types ...
      </Alert>
    );
  }

  if (error && registrationTab === index) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        <AlertTitle>Error</AlertTitle>
        {"An error has occurred: " + error.message}
      </Alert>
    );
  }

  return (
    <>
      {registrationTab === index && (
        <>
          {types.length === 0 ? (
            noRegistrations()
          ) : (
            <Grid
              data-cy="registration-type-list"
              container
              spacing={2}
              marginTop={2}
            >
              {types.map((type, index2) => {
                return (
                  <Grid item xs={12}>
                    <RegistrationType type={type} />
                  </Grid>
                );
              })}
            </Grid>
          )}
          {courseType === "Instructor" && (
            <Fab
              data-cy="add-registration-type-button"
              color="primary"
              onClick={() => NiceModal.show("create-registration-type")}
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
      )}
    </>
  );
}

export default RegistrationTypes;
