import { Alert, AlertTitle, Grid } from "@mui/material";
import React from "react";
import Registration from "./Registration";

function RegistrationsPanel({ value, index, registrations }) {
  const noRegistrations = () => {
    switch (index) {
      case 0:
        return (
          <Alert severity="info" sx={{ mt: 4 }}>
            <AlertTitle>No Upcoming Events</AlertTitle>
          </Alert>
        );

      case 1:
        return (
          <Alert severity="info" sx={{ mt: 4 }}>
            <AlertTitle>No Ongoing Events</AlertTitle>
          </Alert>
        );
      case 2:
        return (
          <Alert severity="info" sx={{ mt: 4 }}>
            <AlertTitle>No Past Events</AlertTitle>
          </Alert>
        );
    }
  };

  return (
    <>
      {value === index &&
        (registrations.length === 0 ? (
          noRegistrations()
        ) : (
          <Grid container spacing={2} marginTop={2}>
            {registrations.map((registration, index) => {
              return (
                <Grid item xs={12}>
                  <Registration registration={registration} />
                </Grid>
              );
            })}
          </Grid>
        ))}
    </>
  );
}

export default RegistrationsPanel;
