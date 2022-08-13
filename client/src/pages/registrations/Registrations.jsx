import { Alert, AlertTitle } from "@mui/material";
import Grid from "@mui/material/Grid";
import moment from "moment";
import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { useLayoutStore } from "../../services/store";
import { getAllRegistrations } from "../../utils/requests";
import Registration from "./Registration";
import RegistrationsBar from "./RegistrationsBar";

const filterByTime = (array, timeTab) => {
  const today = new Date();
  today.setUTCHours(today.getHours());

  return array.filter(function (item) {
    const startObj = new Date(item.date);
    const endObj = new Date(item.date);
    const startTimeObj = new Date(item.startTime);
    const endTimeObj = new Date(item.endTime);
    startObj.setUTCHours(startTimeObj.getUTCHours());
    startObj.setUTCHours(startTimeObj.getUTCHours());
    endObj.setUTCHours(endTimeObj.getUTCHours());
    endObj.setUTCMinutes(endTimeObj.getUTCMinutes());

    switch (timeTab) {
      case 0:
        return moment(startObj).isAfter(today);
      case 1:
        return (
          moment(startObj).isSameOrBefore(today) &&
          moment(endObj).isSameOrAfter(today)
        );
      case 2:
        return moment(endObj).isBefore(today);
      default:
        return true;
    }
  });
};

function Registrations() {
  const timeTab = useLayoutStore((state) => state.timeTab);
  const [registrations, setRegistrations] = useState([]);

  const { isLoading, error, data } = useQuery(
    ["allRegistrations"],
    getAllRegistrations
  );

  useEffect(() => {
    let result = data?.registrations || [];
    result = filterByTime(result, timeTab);
    setRegistrations(result);
  }, [data, timeTab]);

  if (isLoading) {
    return (
      <Alert severity="warning" sx={{ mt: 2 }}>
        <AlertTitle>Loading courses ...</AlertTitle>
      </Alert>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        <AlertTitle>Error</AlertTitle>
        {"An error has occurred: " + error.message}
      </Alert>
    );
  }

  return (
    <>
      <RegistrationsBar />
      <Grid container spacing={2} marginTop={2}>
        {registrations.map((registration, index) => {
          return (
            <Grid item xs={12}>
              <Registration registration={registration} />
            </Grid>
          );
        })}
      </Grid>
    </>
  );
}

export default Registrations;
