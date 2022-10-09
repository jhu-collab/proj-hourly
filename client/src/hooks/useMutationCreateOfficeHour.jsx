import axios from "axios";
import { useMutation, useQueryClient } from "react-query";
import { errorToast } from "../utils/toasts";
import { getConfig } from "./helper";
import NiceModal from "@ebay/nice-modal-react";
import { toast } from "react-toastify";
import { BASE_URL } from "../services/common";
import useTheme from "@mui/material/styles/useTheme";
import useMediaQuery from "@mui/material/useMediaQuery";
import moment from "moment";
import useStoreToken from "./useStoreToken";
import useStoreLayout from "./useStoreLayout";

function useMutationCreateOfficeHour() {
  const { token } = useStoreToken();
  const queryClient = useQueryClient();

  const theme = useTheme();
  const matchUpSm = useMediaQuery(theme.breakpoints.up("sm"));

  const setAnchorEl = useStoreLayout((state) => state.setEventAnchorEl);

  const createOfficeHour = async (officeHour) => {
    try {
      const endpoint = `${BASE_URL}/api/officeHour/create`;
      const res = await axios.post(endpoint, officeHour, getConfig(token));
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  const mutation = useMutation(createOfficeHour, {
    onSuccess: (data) => {
      const officeHour = data.officeHour;
      const startTime = moment(officeHour.startTime).utc().format("LT");
      const endTime = moment(officeHour.endTime).utc().format("LT");

      const startDate = moment(officeHour.startDate).utc().format("MM/DD/YYYY");
      const endDate = moment(officeHour.endDate).utc().format("MM/DD/YYYY");

      queryClient.invalidateQueries(["officeHours"]);
      NiceModal.hide("upsert-event");
      matchUpSm ? setAnchorEl() : NiceModal.hide("mobile-event-popup");

      if (startDate !== endDate) {
        toast.success(
          `Successfully created recurring office hours between ${startDate} and ${endDate} from 
             ${startTime} to ${endTime}`
        );
      } else {
        toast.success(
          `Successfully created office hour on ${startDate} from 
             ${startTime} to ${endTime}`
        );
      }
    },
    onError: (err) => {
      errorToast(err);
    },
  });

  return {
    ...mutation,
  };
}

export default useMutationCreateOfficeHour;
