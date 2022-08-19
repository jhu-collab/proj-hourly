import DeleteOutlined from "@ant-design/icons/DeleteOutlined";
import { Grid } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import { useState } from "react";
import { useMutation, useQueryClient } from "react-query";
import { toast } from "react-toastify";
import ConfirmPopup, { confirmDialog } from "../../components/ConfirmPopup";
import Loader from "../../components/Loader";
import { useEventStore } from "../../services/store";
import { leaveCourse } from "../../utils/requests";

/**
 * Represents the Trash IconButton on the EventDetails component
 * and the associated ConfirmPopup component.
 * @param {*} handlePopoverClose - closes EventDetails popover
 * @returns Delete action button and confirmation popup.
 */
function RemoveCourseAction({ courseid }) {

  return (
    <>
    <IconButton
        sx={{ fontSize: "50px", bottom: 60, left: '93%', }}
        onClick={() => {
          confirmDialog("Do you really want to remove this course?", () => {
              leaveCourse(courseid);
              toast.success(`Successfully removed course!`);
          });
        }}
      >
        <DeleteOutlined />
      </IconButton>     
      <ConfirmPopup />
      
    </>
  );
}

export default RemoveCourseAction;
