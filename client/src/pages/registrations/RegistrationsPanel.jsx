import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Grid from "@mui/material/Grid";
import useStoreLayout from "../../hooks/useStoreLayout";
import Registration from "./Registration";

/**
 * Represents a panel of registrations.
 * @param {Number} index the index of the panel. Helps decide
 *                    whether the panel handles upcoming,
 *                    ongoing, or past registrations
 * @param {*} registrations list of user's registrations
 * @returns a registrations tab panel.
 */
function RegistrationsPanel({ index, registrations, isLoading, error }) {
  const registrationTab = useStoreLayout((state) => state.registrationTab);

  const noRegistrations = () => {
    switch (index) {
      case 0:
        return (
          <Alert severity="info" sx={{ mt: 2 }}>
            No Upcoming Registrations
          </Alert>
        );

      case 1:
        return (
          <Alert severity="info" sx={{ mt: 2 }}>
            No Ongoing Registrations
          </Alert>
        );
      case 2:
        return (
          <Alert severity="info" sx={{ mt: 2 }}>
            No Past Registrations
          </Alert>
        );
    }
  };

  if (isLoading && registrationTab === index) {
    return (
      <Alert severity="warning" sx={{ mt: 2 }}>
        Loading registrations ...
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
      {registrationTab === index &&
        (registrations.length === 0 ? (
          noRegistrations()
        ) : (
          <Grid container spacing={2} marginTop={2}>
            {registrations.map((registration, index2) => {
              return (
                <Grid item xs={12}>
                  <Registration registration={registration} type={index} />
                </Grid>
              );
            })}
          </Grid>
        ))}
    </>
  );
}

export default RegistrationsPanel;
