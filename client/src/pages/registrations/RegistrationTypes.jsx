import useStoreLayout from "../../hooks/useStoreLayout";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Grid from "@mui/material/Grid";
import RegistrationType from "./RegistrationType";

function RegistrationTypes({ index, types }) {
  const registrationTab = useStoreLayout((state) => state.registrationTab);

  const noRegistrations = () => {
    return (
      <Alert severity="info" sx={{ mt: 4 }}>
        <AlertTitle>No Registration Types</AlertTitle>
      </Alert>
    );
  };

  return (
    <>
      {registrationTab === index &&
        (types.length === 0 ? (
          noRegistrations()
        ) : (
          <Grid container spacing={2} marginTop={2}>
            {types.map((type, index2) => {
              return (
                <Grid item xs={12}>
                  <RegistrationType type={type} />
                </Grid>
              );
            })}
          </Grid>
        ))}
    </>
  );
}

export default RegistrationTypes;
