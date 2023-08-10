import StopOutlined from "@ant-design/icons/StopOutlined";
import IconButton from "@mui/material/IconButton";
import ConfirmPopup, { confirmDialog } from "../../../components/ConfirmPopup";
import Loader from "../../../components/Loader";
import useStoreEvent from "../../../hooks/useStoreEvent";
import useMutationCancelCourseCalendarEvent from "../../../hooks/useMutationCancelCourseCalendarEvent";
import useStoreCourse from "../../../hooks/useStoreCourse";
import { useState } from "react";
import { DateTime } from "luxon";

/**
 * Represents the StopOutlined IconButton on the EventPopover component
 * and the associated ConfirmPopup component.
 * @returns Cancel action button and confirmation popup.
 */
function CourseEventCancelAction() {
  const course = useStoreCourse((state) => state.course);
  const date = useStoreEvent((state) => state.start);
  const { mutate, isLoading } = useMutationCancelCourseCalendarEvent();

  return (
    <>
      <IconButton
        sx={{ fontSize: "20px" }}
        onClick={() => {
          confirmDialog(
            "Do you really want to cancel this lecture event?",
            () =>
              mutate({
                courseId: course.id,
                date: DateTime.fromJSDate(date, { zone: "utc" }).toFormat(
                  "MM-dd-yyyy"
                ),
              })
          );
        }}
      >
        <StopOutlined />
      </IconButton>
      <ConfirmPopup />
      {isLoading && <Loader />}
    </>
  );
}

export default CourseEventCancelAction;
