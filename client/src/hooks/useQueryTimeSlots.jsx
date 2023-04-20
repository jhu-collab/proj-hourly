import axios from "axios";
import { DateTime } from "luxon";
import { useQuery } from "react-query";
import { BASE_URL } from "../services/common";
import { errorToast } from "../utils/toasts";
import { getConfig } from "./helper";
import useStoreEvent from "./useStoreEvent";
import useStoreToken from "./useStoreToken";
import Debug from "debug";

const debug = new Debug(`hourly:hooks:useQueryTimeSlots.js`);

function useQueryTimeSlots() {
  const queryKey = ["timeSlots"];
  const token = useStoreToken((state) => state.token);
  const start = useStoreEvent((state) => state.start);

  const id = useStoreEvent((state) => state.id);
  const date = DateTime.fromJSDate(start, { zone: "utc" }).toFormat(
    "MM-dd-yyyy"
  );

  const getTimeSlots = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/officeHour/${id}/getRemainingTimeSlots/${date}`,
        getConfig(token)
      );
      debug("Getting remaining time slots for a specific office hour.")
      return res.data;
    } catch (err) {
      debug({ err });
      errorToast(err);
      throw err;
    }
  };

  return {
    ...useQuery(queryKey, getTimeSlots),
  };
}

export default useQueryTimeSlots;
