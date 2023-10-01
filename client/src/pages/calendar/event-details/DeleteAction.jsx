import DeleteOutlined from "@ant-design/icons/DeleteOutlined";
import IconButton from "@mui/material/IconButton";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import { DateTime } from "luxon";
import ConfirmPopup, { confirmDialog } from "../../../components/ConfirmPopup";
import Loader from "../../../components/Loader";
import { useState } from "react";
import useMutationCancelEvent from "../../../hooks/useMutationCancelEvent";
import useStoreEvent from "../../../hooks/useStoreEvent";
/**
 * Represents the Trash IconButton on the EventPopover component
 * and the associated ConfirmPopup component.
 * @returns Delete action button and confirmation popup.
 */
function DeleteAction() {
  const id = useStoreEvent((state) => state.id);
  const recurring = useStoreEvent((state) => state.recurring);
  const start = useStoreEvent((state) => state.start);

  const [deleteType, setDeleteType] = useState("this");

  const { mutate, isLoading } = useMutationCancelEvent(deleteType);

  return (
    <>
      <IconButton
        data-cy="delete-action-icon"
        sx={{ fontSize: "20px" }}
        onClick={() => {
          confirmDialog("Do you really want to delete this event?", () =>
            recurring && deleteType === "this"
              ? mutate({
                  officeHourId: id,
                  date: DateTime.fromJSDate(start, { zone: "utc" }).toFormat(
                    "MM-dd-yyyy"
                  ),
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
              data-cy="this-event-delete"
            />
            <FormControlLabel
              value="all"
              control={<Radio />}
              label="All events"
              data-cy="all-events-delete"
            />
          </RadioGroup>
        )}
      </ConfirmPopup>
      {isLoading && <Loader />}
    </>
  );
}

export default DeleteAction;
