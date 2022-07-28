import DeleteOutlined from "@ant-design/icons/DeleteOutlined";
import IconButton from "@mui/material/IconButton";
import moment from "moment";
import { useState } from "react";
import { useMutation, useQueryClient } from "react-query";
import { toast } from "react-toastify";
import ConfirmPopup, { confirmDialog } from "../../../components/ConfirmPopup";
import Loader from "../../../components/Loader";
import { useEventStore } from "../../../services/store";
import { cancelAll } from "../../../utils/requests";
import { errorToast } from "../../../utils/toasts";

/**
 * Represents the Trash IconButton on the EventDetails component
 * and the associated ConfirmPopup component.
 * @param {*} handlePopoverClose - closes EventDetails popover
 * @returns Delete action button and confirmation popup.
 */
function DeleteAction({ handlePopoverClose }) {
  const [open, setOpen] = useState(false);

  const { description } = useEventStore();
  const id = description.id;

  const queryClient = useQueryClient();

  const handlePopupToggle = () => {
    setOpen(!open);
  };

  const { mutate, isLoading } = useMutation(cancelAll, {
    onSuccess: (data) => {
      const officeHour = data.officeHourUpdate;

      const date = moment(officeHour.startDate).utc().format("L");
      const startTime = moment(officeHour.startTime).utc().format("LT");
      const endTime = moment(officeHour.endTime).utc().format("LT");

      queryClient.invalidateQueries(["officeHours"]);

      handlePopoverClose();
      handlePopupToggle();

      // TODO: Will need to be refactored once we deal with recurring events.
      toast.success(
        `Successfully deleted office hour on ${date} from 
         ${startTime} to ${endTime}`
      );
    },
    onError: (error) => {
      errorToast(error);
    },
  });

  return (
    <>
      <IconButton
        sx={{ fontSize: "20px" }}
        onClick={() => {
          confirmDialog("Do you really want to delete this event?", () =>
            mutate({ officeHourId: id })
          );
        }}
      >
        <DeleteOutlined />
      </IconButton>
      <ConfirmPopup />
      {isLoading && <Loader />}
    </>
  );
}

export default DeleteAction;
