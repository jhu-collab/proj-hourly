import Typography from "@mui/material/Typography";
import { DateTime } from "luxon";
import { useEffect, useState } from "react";
import useQueryRegistrations from "../../hooks/useQueryRegistrations";
import useQueryRegistrationTypes from "../../hooks/useQueryRegistrationTypes";
import useStoreLayout from "../../hooks/useStoreLayout";
import RegistrationsBar from "./RegistrationsBar";
import RegistrationsPanel from "./RegistrationsPanel";
import RegistrationTypes from "./RegistrationTypes";

function latestEventsFirst(a, b) {
  return b.startObj < a.startObj ? 1 : b.startObj > a.startObj ? -1 : 0;
}

function earliestEventsFirst(a, b) {
  return b.startObj > a.startObj ? 1 : b.startObj < a.startObj ? -1 : 0;
}

const filterByTime = (array, registrationTab) => {
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

    switch (registrationTab) {
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

const addRegistrationTypes = (registrations, registrationTypes) => {
  const durationToRegTypes = new Map();

  for (let i = 0; i < registrationTypes.length; i++) {
    durationToRegTypes.set(
      registrationTypes[i].duration,
      registrationTypes[i].title
    );
  }

  for (let j = 0; j < registrations.length; j++) {
    const end = DateTime.fromISO(registrations[j].endTime);
    const start = DateTime.fromISO(registrations[j].startTime);

    const diffInMinutes = end.diff(start, "minutes").toObject().minutes;

    registrations[j].type = durationToRegTypes.get(diffInMinutes) || "Unknown";
  }
};

/**
 * Represents the Registrations page.
 * @returns Registrations page
 */
function Registrations() {
  const registrationTab = useStoreLayout((state) => state.registrationTab);
  const courseType = useStoreLayout((state) => state.courseType);
  const [registrations, setRegistrations] = useState([]);

  const { isLoading, error, data } = useQueryRegistrations();
  const {
    isLoading: isLoadingTypes,
    error: errorTypes,
    data: dataTypes,
  } = useQueryRegistrationTypes();

  useEffect(() => {
    let result = data?.registrations || [];
    let registrationTypes = dataTypes?.times || [];
    addRegistrationTypes(result, registrationTypes);
    result = filterByTime(result, registrationTab);
    setRegistrations(result);
  }, [data, dataTypes, registrationTab]);

  return (
    <>
      <Typography variant="h4" sx={{ marginBottom: 2.25 }}>
        Registrations
      </Typography>
      <RegistrationsBar />
      <RegistrationsPanel
        value={registrationTab}
        index={0}
        registrations={registrations.sort(earliestEventsFirst)}
        isLoading={isLoading}
        error={error}
      />
      <RegistrationsPanel
        value={registrationTab}
        index={1}
        registrations={registrations.sort(earliestEventsFirst)}
        isLoading={isLoading}
        error={error}
      />
      <RegistrationsPanel
        value={registrationTab}
        index={2}
        registrations={registrations.sort(latestEventsFirst)}
        isLoading={isLoading}
        error={error}
      />
      {courseType === "staff" && (
        <RegistrationTypes
          index={4}
          types={dataTypes?.times || []}
          isLoading={isLoadingTypes}
          error={errorTypes}
        />
      )}
    </>
  );
}

export default Registrations;
