import axios from "axios";
import { useQuery } from "react-query";
import { BASE_URL } from "../services/common";
import { getConfig } from "./helper";
import useStoreEvent from "./useStoreEvent";
import useStoreToken from "./useStoreToken";
import { DateTime } from "luxon";

function useQueryRegistrationStatus() {
  const queryKey = ["registrationStatus"];
  const token = useStoreToken((state) => state.token);
  const id = useStoreEvent((state) => state.id);
  const start = useStoreEvent((state) => state.start);

  const date = DateTime.fromJSDate(start, {
    zone: "utc",
  }).toFormat("MM-dd-yyyy");

  const getRegistrationStatus = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/officeHour/${id}/date/${date}/registrationStatus`,
        getConfig(token)
      );
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  return {
    ...useQuery(queryKey, getRegistrationStatus),
  };
}

export default useQueryRegistrationStatus;
