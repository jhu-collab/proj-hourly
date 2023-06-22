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
import CompassOutlined from "@ant-design/icons/CompassOutlined";
import NiceModal from "@ebay/nice-modal-react";
import useMutationEditLocation from "../../../hooks/useMutationEditLocation";
import EditLocationForm from "../upsert-event/EditLocationForm";

function EditLocation() {
    // const recurring = useStoreEvent((state) => state.recurring);

    // const [editType, setEditType] = useState("this");

    // const { mutate, isLoading } = useMutationEditLocation(editType);


    return (
        <>
            <IconButton
                sx={{ fontSize: "20px" }}
                onClick={/*!recurring ?*/ () => NiceModal.show("upsert-event", { type: "location" })} /*: () => {
                    confirmDialog("Do you really want to edit this event?", () =>
                      recurring && editType === "this"
                      ? <EditLocationForm/>
                      : () => NiceModal.show("upsert-event", { type: "location" })
                        // ? mutate({
                        //     officeHourId: id,
                        //     date: DateTime.fromJSDate(start, { zone: "utc" }).toFormat(
                        //       "MM-dd-yyyy"
                        //     ),
                        //   })
                        // : mutate({ officeHourId: id })
                    );
                  }}*/
            >
                <CompassOutlined />
            </IconButton>
            {/* <ConfirmPopup {...(recurring && { header: "Edit recurring event" })}>
                {recurring && (
                    <RadioGroup
                        value={editType}
                        onChange={(event) => setEditType(event.target.value)}
                    >
                        <FormControlLabel
                            value="this"
                            control={<Radio />}
                            label="This event"
                        />
                        <FormControlLabel
                            value="all"
                            control={<Radio />}
                            label="All events"
                        />
                    </RadioGroup>
                )}
            </ConfirmPopup>
            {isLoading && <Loader />} */}
        </>
    );
};

export default EditLocation;