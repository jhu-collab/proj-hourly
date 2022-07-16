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

function DeleteAction({ event, handleClose }) {
  const [open, setOpen] = useState(false);
  const { start, extendedProps } = event;
  const [date, setDate] = useState("");
  const [id, setId] = useState(-1);
  const { currentCourse } = useStore();
  const queryClient = useQueryClient();
  console.log(event);

  useEffect(() => {
    if (extendedProps.description) {
      const des = JSON.parse(extendedProps.description);
      setId(des.id);
    }

    start && setDate(getIsoDate(start));
  }, [extendedProps, start]);

  const { mutate, isLoading } = useMutation(cancelOnDate, {
    onSuccess: (data) => {
      const officeHour = data.officeHourUpdate;
      const date = new Date(officeHour.startDate).toDateString();

      const startTime = officeHour.startTime.substring(11, 19);
      const endTime = officeHour.endTime.substring(11, 19);

      queryClient.invalidateQueries(["officeHours"]);
      handlePopupToggle();
      handleClose();

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

  const handlePopupToggle = () => {
    setOpen(!open);
  };

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
