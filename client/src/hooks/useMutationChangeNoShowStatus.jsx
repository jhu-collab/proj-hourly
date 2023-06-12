import axios from "axios";
import { useMutation, useQueryClient } from "react-query";
import { errorToast } from "../utils/toasts";
import { getConfig } from "./helper";
import NiceModal from "@ebay/nice-modal-react";
import { toast } from "react-toastify";
import { BASE_URL } from "../services/common";
import useStoreToken from "./useStoreToken";
import Debug from "debug";

const debug = new Debug(`hourly:hooks:useMutationChangeNoShowStatus.jsx`);

function useMutationChangeNoShowStatus(registrationId) {
  const { token } = useStoreToken();
  const queryClient = useQueryClient();

  const changeNoShowStatus = async () => {
    try {
      debug("Sending registration id to the backend to change no show status...");
      const endpoint = `${BASE_URL}/api/officeHour/editRegistrationNoShow`;
      const res = await axios.post(
        endpoint,
        { registrationId },
        getConfig(token)
      );
      debug("Successful! Returning result data...");
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  const mutate = useMutation(changeNoShowStatus, {
    onSuccess: (data) => {
      const registration = data.updatedRegistration;

      queryClient.invalidateQueries(["registrationStatus"]);
      queryClient.invalidateQueries(["allRegistrations"]);
      
      registration.isNoShow ? 
        toast.success(`Successfully marked this registration as no-show!`) :
        toast.success(`Successfully marked this registration as present!`)
    },
    onError: (err) => {
      debug({ err });
      errorToast(err);
    },
  });

  return {
    ...mutate,
  };
}

export default useMutationChangeNoShowStatus;
