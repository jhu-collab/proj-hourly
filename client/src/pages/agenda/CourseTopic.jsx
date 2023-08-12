import { yupResolver } from "@hookform/resolvers/yup";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { useForm } from "react-hook-form";
import AnimateButton from "../../components/AnimateButton";
import ConfirmPopup, { confirmDialog } from "../../components/ConfirmPopup";
import Form from "../../components/form-ui/Form";
import FormInputText from "../../components/form-ui/FormInputText";
import MainCard from "../../components/MainCard";
import useMutationEditCourseCalendarEventTitle from "../../hooks/useMutationEditCourseCalendarEventTitle";
import useStoreCourse from "../../hooks/useStoreCourse";
import useStoreLayout from "../../hooks/useStoreLayout";
import { DateTime } from "luxon";

/**
 * Represents a single CourseTopic card.
 * @param {*} courseTopic topic object
 * @returns a single CourseTopic component.
 */
function CourseTopic({ topic, date }) {
  const [edit, setEdit] = useState(false);

  const { mutate } = useMutationEditCourseCalendarEventTitle();

  const course = useStoreCourse((state) => state.course);
  const courseType = useStoreLayout((state) => state.courseType);

  const { control, handleSubmit } = useForm({
    defaultValues: {
      title: topic,
    },
    /*resolver: yupResolver(topicSchema),*/
  });

  const onSubmit = (data) => {
    mutate({
      courseId: course.id,
      date: date.split("T")[0],
      title: data.title,
    });
    setEdit(false);
  };

  const handleOnClickCancelBtn = (e) => {
    e.preventDefault();
    setEdit(false);
  };

  const handleOnClickEditBtn = (e) => {
    e.preventDefault();
    setEdit(true);
  };

  return (
    <>
      <MainCard sx={{ padding: 2 }} content={false}>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
          >
            <Typography variant="h5">
              {DateTime.fromISO(date).toLocaleString(
                DateTime.DATE_MED_WITH_WEEKDAY
              )}
            </Typography>
            {edit && courseType === "Instructor" ? (
              <FormInputText
                name="title"
                control={control}
                sx={{ width: 230 }}
              />
            ) : (
              <Typography variant="h5">{topic}</Typography>
            )}
            {edit && courseType === "Instructor" && (
              <Stack direction="row" spacing={1}>
                <AnimateButton>
                  <Button variant="contained" type="submit">
                    Submit
                  </Button>
                </AnimateButton>
                <AnimateButton>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={handleOnClickCancelBtn}
                  >
                    Cancel
                  </Button>
                </AnimateButton>
              </Stack>
            )}
            {!edit && courseType === "Instructor" && (
              <Stack direction="row" spacing={1}>
                <AnimateButton>
                  <Button variant="contained" onClick={handleOnClickEditBtn}>
                    Edit
                  </Button>
                </AnimateButton>
              </Stack>
            )}
          </Stack>
        </Form>
      </MainCard>
      <ConfirmPopup />
    </>
  );
}

export default CourseTopic;
