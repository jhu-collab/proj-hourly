import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import { DateTime } from "luxon";
import { useEffect, useState } from "react";
import useQueryRegistrations from "../../hooks/useQueryRegistrations";
import useStoreLayout from "../../hooks/useStoreLayout";
import RegistrationsBar from "./RegistrationsBar";
import RegistrationsPanel from "./RegistrationsPanel";

function latestEventsFirst(a, b) {
  return b.startObj < a.startObj ?  1 
       : b.startObj > a.startObj ? -1 
       : 0;               
};

function earliestEventsFirst(a, b) {
  return b.startObj > a.startObj ?  1 
       : b.startObj < a.startObj ? -1 
       : 0;               
};

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
        return DateTime.fromJSDate(startObj) > DateTime.fromJSDate(today);
      case 1:
        return (
          DateTime.fromJSDate(startObj) <= DateTime.fromJSDate(today) &&
          DateTime.fromJSDate(endObj) >= DateTime.fromJSDate(today)
        );
      case 2:
        return DateTime.fromJSDate(endObj) < DateTime.fromJSDate(today);
      default:
        return true;
    }
  });
};

/**
 * Represents the Registrations page.
 * @returns Registrations page
 */
function Registrations() {
  const timeTab = useStoreLayout((state) => state.timeTab);
  const [registrations, setRegistrations] = useState([]);

  const { isLoading, error, data } = useQueryRegistrations();

  useEffect(() => {
    let result = data?.registrations || [];
    result = filterByTime(result, timeTab);
    setRegistrations(result);
  }, [data, timeTab]);

  return (
    <>
      <RegistrationsBar />
      {isLoading && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          <AlertTitle>Loading registrations ...</AlertTitle>
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          <AlertTitle>Error</AlertTitle>
          {"An error has occurred: " + error.message}
        </Alert>
      )}
      {!isLoading && !error && (
        <>
          <RegistrationsPanel
            value={timeTab}
            index={0}
            registrations={registrations.sort(earliestEventsFirst)}
          />
          <RegistrationsPanel
            value={timeTab}
            index={1}
            registrations={registrations.sort(earliestEventsFirst)}
          />
          <RegistrationsPanel
            value={timeTab}
            index={2}
            registrations={registrations.sort(latestEventsFirst)}
          />
        </>
      )}
    </>
  );
}

export default Registrations;
