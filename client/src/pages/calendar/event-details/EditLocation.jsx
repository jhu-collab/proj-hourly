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

function EditLocation() {
    return (
        <>
            <IconButton
                sx={{ fontSize: "20px" }}
                onClick={() => NiceModal.show("upsert-event", { type: "location" })}
            >
            <CompassOutlined />
            </IconButton>
        </>
    )
};

export default EditLocation;