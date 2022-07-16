import DeleteOutlined from "@ant-design/icons/DeleteOutlined";
import IconButton from "@mui/material/IconButton";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "react-query";
import { toast } from "react-toastify";
import ConfirmPopup, { confirmDialog } from "../../../components/ConfirmPopup";
import Loader from "../../../components/Loader";
import useStore from "../../../services/store";
import { getIsoDate, getLocaleTime } from "../../../utils/helpers";
import { cancelOnDate } from "../../../utils/requests";

/**
 * Represents the Trash IconButton on the EventDetails component
 * and the associated ConfirmPopup component.
 * @param {*} event - FullCalendar Event object
 * @param {*} handlePopoverClose - closes EventDetails popover
 * @returns Delete action button and confirmation popup.
 */
function DeleteAction({ event, handlePopoverClose }) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState("");
  const [id, setId] = useState(-1);

  const { start, extendedProps } = event;
  const { currentCourse } = useStore();

  const queryClient = useQueryClient();

  useEffect(() => {
    if (extendedProps.description) {
      const des = JSON.parse(extendedProps.description);
      setId(des.id);
    }

    start && setDate(getIsoDate(start));
  }, [extendedProps, start]);

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
      <ConfirmPopup open={open} onClose={handlePopupToggle} />
      {isLoading && <Loader />}
    </>
  );
}

export default DeleteAction;
