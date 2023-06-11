import axios from "axios";
import { useMutation, useQueryClient } from "react-query";
import { errorToast } from "../utils/toasts";
import { getConfig } from "./helper";
import NiceModal from "@ebay/nice-modal-react";
import { toast } from "react-toastify";
import { BASE_URL } from "../services/common";
import useTheme from "@mui/material/styles/useTheme";
import useMediaQuery from "@mui/material/useMediaQuery";
import { DateTime } from "luxon";
import useStoreToken from "./useStoreToken";
import useStoreEvent from "./useStoreEvent";
import useStoreLayout from "./useStoreLayout";
import Debug from "debug";

const debug = new Debug(`hourly:hooks:useMutationEditLocation.jsx`);

function useMutationEditLocation() {
    const { token } = useStoreToken();
    const queryClient = useQueryClient();
  
    const id = useStoreEvent((state) => state.id);
  
    const theme = useTheme();
    const matchUpSm = useMediaQuery(theme.breakpoints.up("sm"));
  
    const setAnchorEl = useStoreLayout((state) => state.setEventAnchorEl);
  
    const editLocation = async (officeHour) => {
      try {
        debug("Sending office hour to edit one occurrence to the backend...");
        console.log(officeHour);
        const endpoint = `${BASE_URL}/api/officeHour/editLocationSingleDay`;
        const res = await axios.post(endpoint, { officeHourId: id, ...officeHour}, getConfig(token));
        debug("Successful! Returning result data...");
        return res.data;
      } catch (err) {
        throw err;
      }
    };
  
    const mutation = useMutation(
      editLocation,
      {
        onSuccess: (data) => {
          queryClient.invalidateQueries(["officeHours"]);
          NiceModal.hide("upsert-event");
          matchUpSm ? setAnchorEl() : NiceModal.hide("mobile-event-popup");
  
          toast.success(`Successfully edited event`);
        },
        onError: (error) => {
          debug( {error} );
          errorToast(error);
        },
      }
    );
  
    return {
      ...mutation,
    };
  }
  
  export default useMutationEditLocation;