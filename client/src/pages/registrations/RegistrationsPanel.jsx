import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Grid from "@mui/material/Grid";
import Registration from "./Registration";

/**
 * Represents a panel of registrations.
 * @param {int} index the index of the panel. Helps decide
 *                    whether the panel handles upcoming,
 *                    ongoing, or past registrations
 * @param {*} registrations list of user's registrations
 * @returns a registrations tab panel.
 */
function RegistrationsPanel({ index, registrations }) {
  const timeTab = useStoreLayout((state) => state.timeTab);

  const noRegistrations = () => {
    switch (index) {
      case 0:
        return (
          <Alert severity="info" sx={{ mt: 4 }}>
            <AlertTitle>No Upcoming Registrations</AlertTitle>
          </Alert>
        );

      case 1:
        return (
          <Alert severity="info" sx={{ mt: 4 }}>
            <AlertTitle>No Ongoing Registrations</AlertTitle>
          </Alert>
        );
      case 2:
        return (
          <Alert severity="info" sx={{ mt: 4 }}>
            <AlertTitle>No Past Registrations</AlertTitle>
          </Alert>
        );
    }
  };

  return (
    <>
      {timeTab === index &&
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
