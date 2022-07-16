import DeleteOutlined from "@ant-design/icons/DeleteOutlined";
import IconButton from "@mui/material/IconButton";
import { useState } from "react";
import { useMutation, useQueryClient } from "react-query";
import { toast } from "react-toastify";
import ConfirmPopup, { confirmDialog } from "../../../components/ConfirmPopup";
import Loader from "../../../components/Loader";
import useStore, { useEventStore } from "../../../services/store";
import { getIsoDate, getLocaleTime } from "../../../utils/helpers";
import { cancelOnDate } from "../../../utils/requests";

/**
 * Represents the Trash IconButton on the EventDetails component
 * and the associated ConfirmPopup component.
 * @param {*} handlePopoverClose - closes EventDetails popover
 * @returns Delete action button and confirmation popup.
 */
function DeleteAction({ handlePopoverClose }) {
  const [open, setOpen] = useState(false);

  const { currentCourse } = useStore();
  const { start, description } = useEventStore();
  const date = getIsoDate(start);
  const id = description.id;

  const queryClient = useQueryClient();

  const handlePopupToggle = () => {
    setOpen(!open);
  };

  const { mutate, isLoading } = useMutation(cancelOnDate, {
    onSuccess: (data) => {
      const officeHour = data.officeHourUpdate;
      const date = new Date(officeHour.startDate).toDateString();

      const startTime = officeHour.startTime.substring(11, 19);
      const endTime = officeHour.endTime.substring(11, 19);

      queryClient.invalidateQueries(["officeHours"]);

      handlePopoverClose();
      handlePopupToggle();

      // TODO: Will need to be refactored once we deal with recurring events.
      toast.success(
        `Successfully deleted office hour on ${date} from 
         ${getLocaleTime(startTime)} to ${getLocaleTime(endTime)}`
      );
    },
    onError: (error) => {
      toast.error("An error has occurred: " + error.message);
    },
  });

  return (
    <>
      <IconButton
        sx={{ fontSize: "20px" }}
        onClick={() => {
          confirmDialog("Do you really want to delete this event?", () =>
            mutate({ officeHourId: id, date: date, courseId: currentCourse.id })
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
