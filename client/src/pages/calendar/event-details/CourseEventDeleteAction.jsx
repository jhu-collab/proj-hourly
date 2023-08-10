import DeleteOutlined from "@ant-design/icons/DeleteOutlined";
import IconButton from "@mui/material/IconButton";
import ConfirmPopup, { confirmDialog } from "../../../components/ConfirmPopup";
import Loader from "../../../components/Loader";
import useStoreEvent from "../../../hooks/useStoreEvent";
import useMutationCancelCourseCalendarEvent from "../../../hooks/useMutationCancelCourseCalendarEvent";
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
  const recurring = useStoreEvent((state) => state.recurring);
  const [deleteType, setDeleteType] = useState("this");
  //const deleteType = "this";

  const { mutate, isLoading } =
    useMutationCancelCourseCalendarEvent(deleteType); // TODO: CHANGE THIS

  return (
    <>
      <IconButton
        sx={{ fontSize: "20px" }}
        onClick={() => {
          confirmDialog(
            "Do you really want to cancel this lecture event?",
            () =>
              deleteType === "this"
                ? mutate({
                    courseId: course.id,
                    date: DateTime.fromJSDate(date, { zone: "utc" }).toFormat(
                      "MM-dd-yyyy"
                    ),
                  })
                : mutate({ courseId: course.id })
          );
          console.log("clicked");
        }}
      >
        <DeleteOutlined />
      </IconButton>
      <ConfirmPopup
        /*{...(recurring && { header: "Delete recurring lecture event" })}*/
      >
        {/*recurring && (
          <RadioGroup
            value={deleteType}
            onChange={(event) => setDeleteType(event.target.value)}
          >
            <FormControlLabel
              value="this"
              control={<Radio />}
              label="This lecture event"
            />
            <FormControlLabel
              value="all"
              control={<Radio />}
              label="All lecture events"
            />
          </RadioGroup>
        )*/}
      </ConfirmPopup>
      {isLoading && <Loader />}
    </>
  );
}

export default CourseEventDeleteAction;