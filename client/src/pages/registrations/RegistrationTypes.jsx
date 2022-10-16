import useStoreLayout from "../../hooks/useStoreLayout";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Grid from "@mui/material/Grid";
import RegistrationType from "./RegistrationType";

function RegistrationTypes({ index, types }) {
  const timeTab = useStoreLayout((state) => state.timeTab);

  const noRegistrations = () => {
    return (
      <Alert severity="info" sx={{ mt: 4 }}>
        <AlertTitle>No Registration Types</AlertTitle>
      </Alert>
    );
  };

  return (
    <>
      {timeTab === index &&
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
