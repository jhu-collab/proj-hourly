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
  const endObjectA = new Date(a.date);
  const startObjectB = new Date(b.date);

  const endTimeObjA = new Date(a.endTime);
  const startTimeObjB = new Date(b.startTime);

  startObjectB.setUTCHours(startTimeObjB.getUTCHours());
  startObjectB.setUTCMinutes(startTimeObjB.getUTCMinutes());
  endObjectA.setUTCHours(endTimeObjA.getUTCHours());
  endObjectA.setUTCMinutes(endTimeObjA.getUTCMinutes());

  return startObjectB > endObjectA ? 1 : startObjectB < endObjectA ? -1 : 0;
}

function earliestEventsFirst(a, b) {
  const endObjectA = new Date(a.date);
  const startObjectB = new Date(b.date);

  const endTimeObjA = new Date(a.endTime);
  const startTimeObjB = new Date(b.startTime);

  startObjectB.setUTCHours(startTimeObjB.getUTCHours());
  startObjectB.setUTCMinutes(startTimeObjB.getUTCMinutes());
  endObjectA.setUTCHours(endTimeObjA.getUTCHours());
  endObjectA.setUTCMinutes(endTimeObjA.getUTCMinutes());

  return startObjectB < endObjectA ? 1 : startObjectB > endObjectA ? -1 : 0;
}

const filterByTime = (array, registrationTab) => {
  const today = new Date();

  return array.filter(function (item) {
    const startObj = new Date(item.date);
    const endObj = new Date(item.date);
    const startTimeObj = new Date(item.startTime);
    const endTimeObj = new Date(item.endTime);
    startObj.setUTCHours(startTimeObj.getUTCHours());
    startObj.setUTCMinutes(startTimeObj.getUTCMinutes());
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
    registrationTab === 2
      ? result.sort(latestEventsFirst)
      : result.sort(earliestEventsFirst);
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
        registrations={registrations}
        isLoading={isLoading}
        error={error}
      />
      <RegistrationsPanel
        value={registrationTab}
        index={1}
        registrations={registrations}
        isLoading={isLoading}
        error={error}
      />
      <RegistrationsPanel
        value={registrationTab}
        index={2}
        registrations={registrations}
        isLoading={isLoading}
        error={error}
      />
      {(courseType === "Staff" || courseType === "Instructor") && (
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
