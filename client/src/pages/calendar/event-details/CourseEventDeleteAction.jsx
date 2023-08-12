import DeleteOutlined from "@ant-design/icons/DeleteOutlined";
import IconButton from "@mui/material/IconButton";
import ConfirmPopup, { confirmDialog } from "../../../components/ConfirmPopup";
import Loader from "../../../components/Loader";
import useStoreEvent from "../../../hooks/useStoreEvent";
import useMutationDeleteCourseCalendarEvent from "../../../hooks/useMutationDeleteCourseCalendarEvent";
import useStoreCourse from "../../../hooks/useStoreCourse";
import { useState } from "react";
import { DateTime } from "luxon";

/**
 * Represents the Trash IconButton on the EventPopover component
 * and the associated ConfirmPopup component.
 * @returns Delete action button and confirmation popup.
 */
function CourseEventDeleteAction() {
  const course = useStoreCourse((state) => state.course);
  const date = useStoreEvent((state) => state.start);
  const { mutate, isLoading } = useMutationDeleteCourseCalendarEvent("this");

  return (
    <>
      <IconButton
        sx={{ fontSize: "20px" }}
        onClick={() => {
          confirmDialog(
            "Do you really want to delete this lecture event?",
            () =>
              mutate({ date }));
        }}
      >
        <DeleteOutlined />
      </IconButton>
      <ConfirmPopup />
      {isLoading && <Loader />}
    </>
  );
}

export default CourseEventDeleteAction;
