import DeleteOutlined from "@ant-design/icons/DeleteOutlined";
import IconButton from "@mui/material/IconButton";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import moment from "moment";
import ConfirmPopup, { confirmDialog } from "../../../components/ConfirmPopup";
import Loader from "../../../components/Loader";
import { useEventStore } from "../../../services/store";
import { useState } from "react";
import useMutationCancelEvent from "../../../hooks/useMutationCancelEvent";
/**
 * Represents the Trash IconButton on the EventPopover component
 * and the associated ConfirmPopup component.
 * @returns Delete action button and confirmation popup.
 */
function DeleteAction() {
  const id = useEventStore((state) => state.id);
  const recurring = useEventStore((state) => state.recurring);
  const start = useEventStore((state) => state.start);

  const [deleteType, setDeleteType] = useState("this");

  const { mutate, isLoading } = useMutationCancelEvent(deleteType);

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
