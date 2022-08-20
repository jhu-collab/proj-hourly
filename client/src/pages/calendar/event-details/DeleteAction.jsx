import DeleteOutlined from "@ant-design/icons/DeleteOutlined";
import IconButton from "@mui/material/IconButton";
import moment from "moment";
import { useMutation, useQueryClient } from "react-query";
import { toast } from "react-toastify";
import ConfirmPopup, { confirmDialog } from "../../../components/ConfirmPopup";
import Loader from "../../../components/Loader";
import { useEventStore, useLayoutStore } from "../../../services/store";
import { cancelAll, cancelOnDate } from "../../../utils/requests";
import { errorToast } from "../../../utils/toasts";
import useMediaQuery from "@mui/material/useMediaQuery";
import useTheme from "@mui/material/styles/useTheme";
import NiceModal from "@ebay/nice-modal-react";
import { FormControlLabel, Radio, RadioGroup } from "@mui/material";
import { useState } from "react";
/**
 * Represents the Trash IconButton on the EventPopover component
 * and the associated ConfirmPopup component.
 * @returns Delete action button and confirmation popup.
 */
function DeleteAction() {
  const theme = useTheme();
  const matchUpSm = useMediaQuery(theme.breakpoints.up("sm"));

  const setAnchorEl = useLayoutStore((state) => state.setEventAnchorEl);

  const id = useEventStore((state) => state.id);
  const recurring = useEventStore((state) => state.recurring);
  const start = useEventStore((state) => state.start);

  const [deleteType, setDeleteType] = useState("this");

  const queryClient = useQueryClient();

  const { mutate, isLoading } = useMutation(
    recurring && deleteType === "this" ? cancelOnDate : cancelAll,
    {
      onSuccess: (data) => {
        const officeHour = data.officeHourUpdate;

        const date = moment(officeHour.startDate).utc().format("L");
        const startTime = moment(officeHour.startTime).utc().format("LT");
        const endTime = moment(officeHour.endTime).utc().format("LT");

        queryClient.invalidateQueries(["officeHours"]);

        matchUpSm ? setAnchorEl() : NiceModal.hide("mobile-event-popup");

        recurring && deleteType === "all"
          ? toast.success(
              `Successfully deleted all events from 
         ${startTime} to ${endTime}`
            )
          : toast.success(
              `Successfully deleted event on ${date} from 
         ${startTime} to ${endTime}`
            );
      },
      onError: (error) => {
        errorToast(error);
      },
    }
  );

  return (
    <>
      <IconButton
        sx={{ fontSize: "20px" }}
        onClick={() => {
          confirmDialog("Do you really want to delete this event?", () =>
            recurring && deleteType === "this"
              ? mutate({
                  officeHourId: id,
                  date: moment(start).utc().format("MM-DD-YYYY"),
                })
              : mutate({ officeHourId: id })
          );
        }}
      >
        <DeleteOutlined />
      </IconButton>
      <ConfirmPopup {...(recurring && { header: "Delete recurring event" })}>
        {recurring && (
          <RadioGroup
            value={deleteType}
            onChange={(event) => setDeleteType(event.target.value)}
          >
            <FormControlLabel
              value="this"
              control={<Radio />}
              label="This event"
            />
            {/* TODO: Backend needs to create a route to delete this and following
          events */}
            <FormControlLabel
              value="all"
              control={<Radio />}
              label="All events"
            />
          </RadioGroup>
        )}
      </ConfirmPopup>
      {isLoading && <Loader />}
    </>
  );
}

export default DeleteAction;
