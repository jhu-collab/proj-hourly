import axios from "axios";
import moment from "moment";
import { useQuery } from "react-query";
import { BASE_URL } from "../services/common";
import { useEventStore, useStoreToken } from "../services/store";
import { errorToast } from "../utils/toasts";
import { getConfig } from "./helper";

function useQueryTimeSlots() {
  const queryKey = ["timeSlots"];
  const token = useStoreToken((state) => state.token);

  const id = useEventStore((state) => state.id);
  const date = moment(useEventStore((state) => state.start)).format(
    "MM-DD-YYYY"
  );

  const getTimeSlots = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/officeHour/${id}/getRemainingTimeSlots/${date}`,
        getConfig(token)
      );
      return res.data;
    } catch (err) {
      errorToast(err);
      throw err;
    }
  };

  return {
    ...useQuery(queryKey, getTimeSlots),
  };
}

export default useQueryTimeSlots;
