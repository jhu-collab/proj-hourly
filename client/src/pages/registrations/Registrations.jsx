import { Grid, List, ListItem } from "@mui/material";
import moment from "moment";
import React from "react";
import Registration from "./Registration";

const sampleRegistrations = [
  { date: "Wednesday, August 24, 2022", startTime: "9:00AM", endTime: "10:00AM",  },
  { date: "Friday, August 26, 2022", startTime: "10:00AM", endTime: "11:00AM",},
  { date: "Monday, August 29, 2022", startTime: "12:00PM", endTime: "1:00PM",},
];

function Registrations() {
  return (
    <Grid container spacing={2}>
      {sampleRegistrations.map((registration, index) => {
        return (
          <Grid item xs={12}>
            <Registration registration={registration}/>
          </Grid>
        );
      })}
    </Grid>
  );
}

export default Registrations;
