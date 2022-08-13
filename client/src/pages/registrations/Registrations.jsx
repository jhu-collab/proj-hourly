import Grid from "@mui/material/Grid";
import moment from "moment";
import { useEffect, useState } from "react";
import { useLayoutStore } from "../../services/store";
import Registration from "./Registration";
import RegistrationsBar from "./RegistrationsBar";

const sampleRegistrations = [
  {
    date: "2022-08-11T00:00:00.000Z",
    startTime: "1970-01-01T11:00:00.000Z",
    endTime: "1970-01-01T12:00:00.000Z",
  },
  {
    date: "2022-08-12T00:00:00.000Z",
    startTime: "1970-01-01T11:00:00.000Z",
    endTime: "1970-01-01T12:00:00.000Z",
  },
  {
    date: "2022-08-13T00:00:00.000Z",
    startTime: "1970-01-01T12:00:00.000Z",
    endTime: "1970-01-01T12:20:00.000Z",
  },
  {
    date: "2022-08-13T00:00:00.000Z",
    startTime: "1970-01-01T11:00:00.000Z",
    endTime: "1970-01-01T13:00:00.000Z",
  },
  {
    date: "2022-08-14T00:00:00.000Z",
    startTime: "1970-01-01T12:00:00.000Z",
    endTime: "1970-01-01T12:20:00.000Z",
  },
  {
    date: "2022-08-15T00:00:00.000Z",
    startTime: "1970-01-01T11:00:00.000Z",
    endTime: "1970-01-01T12:00:00.000Z",
  },
];

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
  const [registrations, setRegistrations] = useState(sampleRegistrations);

  useEffect(() => {
    let result = sampleRegistrations;
    result = filterByTime(result, timeTab);
    setRegistrations(result);
  }, [timeTab]);

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
