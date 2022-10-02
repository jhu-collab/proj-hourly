import axios from "axios";
import { useMutation } from "react-query";
import { errorToast } from "../utils/toasts";
import { getConfig } from "./helper";
import NiceModal from "@ebay/nice-modal-react";
import { toast } from "react-toastify";
import { useLayoutStore, useStoreToken } from "../services/store";
import { BASE_URL } from "../services/common";
import moment from "moment";
import useTheme from "@mui/material/styles/useTheme";
import useMediaQuery from "@mui/material/useMediaQuery";

function useMutationRegister() {
  const { token } = useStoreToken();

  const theme = useTheme();
  const matchUpSm = useMediaQuery(theme.breakpoints.up("sm"));

  const setAnchorEl = useLayoutStore((state) => state.setEventAnchorEl);

  const register = async (officeHour) => {
    try {
      const endpoint = `${BASE_URL}/api/officeHour/register`;
      const res = await axios.post(endpoint, officeHour, getConfig(token));
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  const mutation = useMutation(register, {
    onSuccess: (data) => {
      const registration = data.registration;

      const date = moment(registration.date).utc().format("L");
      const startTime = moment(registration.startTime).utc().format("LT");
      const endTime = moment(registration.endTime).utc().format("LT");

      NiceModal.hide("register-event");
      matchUpSm ? setAnchorEl() : NiceModal.hide("mobile-event-popup");
      toast.success(
        `Successfully registered for session on ${date} from 
           ${startTime} to ${endTime}`
      );
    },
    onError: (err) => {
      errorToast(err);
    },
  });

  return {
    ...mutation,
  };
}

export default useMutationRegister;
