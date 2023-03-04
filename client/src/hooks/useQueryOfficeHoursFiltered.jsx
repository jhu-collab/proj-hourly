import axios from "axios";
import { useQuery } from "react-query";
import { BASE_URL } from "../services/common";
import { getConfig } from "./helper";
import useStoreCourse from "./useStoreCourse";
import useStoreToken from "./useStoreToken";
import pkg from "rrule";
const { RRule, RRuleSet } = pkg;

import { generateRecurringEventJson, generateSingleEventJson } from "../../../server/src/util/icalHelpers";

function useQueryOfficeHoursFiltered() {
  const queryKey = ["officeHoursFiltered"];
  const token = useStoreToken((state) => state.token);
  const course = useStoreCourse((state) => state.course);

  const calendarizeFilteredOH = (officeHours) => {
    const events = [];
    officeHours.forEach((officeHour) => {
        if (officeHour.isRecurring) {
          events.push(...generateRecurringEventJson(officeHour));
        } else {
          events.push(generateSingleEventJson(officeHour));
        }
      });
      return events;
    }

  const getOfficeHoursFiltered = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/course/${course.id}/officeHours/mine`,
        getConfig(token)
      );
      const OHData = res.data.officeHours;
      console.log(OHData);
      const calendarizedData = calendarizeFilteredOH(OHData);

      console.log(calendarizedData);
      return calendarizedData;
    } catch (err) {
      throw err;
    }
  };

  return {
    ...useQuery(queryKey, getOfficeHoursFiltered),
  };
}

export default useQueryOfficeHoursFiltered;
