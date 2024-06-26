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
import useMutationDeleteCourseCalendarEvent from "../../hooks/useMutationDeleteCourseCalendarEvent";
import useMutationCancelCourseCalendarEvent from "../../hooks/useMutationCancelCourseCalendarEvent";
import useStoreCourse from "../../hooks/useStoreCourse";
import useStoreLayout from "../../hooks/useStoreLayout";
import { DateTime } from "luxon";
import { agendaSchema } from "../../utils/validators";
import { Chip, Grid } from "@mui/material";

/**
 * Represents a single AgendaTopic card.
 * @param {*} AgendaTopic topic object
 * @returns a single AgendaTopic component.
 */
function AgendaTopic({ topic, date, isCancelled, isRemote }) {
  const [edit, setEdit] = useState(false);

  const { mutate: mutateEdit } = useMutationEditCourseCalendarEventTitle();
  const { mutate: mutateCancel } = useMutationCancelCourseCalendarEvent();
  const { mutate: mutateDelete } = useMutationDeleteCourseCalendarEvent("this");

  const course = useStoreCourse((state) => state.course);
  const courseType = useStoreLayout((state) => state.courseType);

  const { control, handleSubmit } = useForm({
    defaultValues: {
      title: topic,
    },
    resolver: yupResolver(agendaSchema),
  });

  const onSubmit = (data) => {
    mutateEdit({
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
          <Grid container spacing={2} columns={3} alignItems="center">
            <Grid item xs={1} key={0}>
              <Typography
                variant="h5"
                color={isCancelled ? "error.main" : "text.primary"}
              >
                {DateTime.fromISO(date).toLocaleString(
                  DateTime.DATE_MED_WITH_WEEKDAY
                )}
              </Typography>
            </Grid>
            {edit && courseType === "Instructor" ? (
              <Grid item xs={1} key={1}>
                <FormInputText
                  name="title"
                  control={control}
                  sx={{ width: 230 }}
                />
              </Grid>
            ) : (
              <Grid item xs={1} key={2}>
                <Stack
                  direction="row"
                  justifyContent="flex-start"
                  alignItems="center"
                  spacing={3}
                >
                  <Typography
                    variant="h5"
                    color={isCancelled ? "error.main" : "text.primary"}
                  >
                    {topic}
                  </Typography>
                  {isRemote && <Chip label="Remote" />}
                </Stack>
              </Grid>
            )}
            {edit && courseType === "Instructor" && (
              <Grid item xs={1} key={3}>
                <Stack direction="row" spacing={1} justifyContent="flex-end">
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
              </Grid>
            )}
            {!edit && courseType === "Instructor" && (
              <Grid item xs={1} key={4}>
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  {!isCancelled && (
                    <AnimateButton>
                      <Button
                        variant="contained"
                        onClick={handleOnClickEditBtn}
                      >
                        Edit
                      </Button>
                    </AnimateButton>
                  )}
                  <AnimateButton>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => {
                        confirmDialog(
                          `Do you really want to change the cancellation status of the "${topic}" course calendar event?`,
                          () =>
                            mutateCancel({
                              courseId: course.id,
                              date: DateTime.fromJSDate(new Date(date), {
                                zone: "utc",
                              }).toFormat("MM-dd-yyyy"),
                            })
                        );
                      }}
                    >
                      Cancel
                    </Button>
                  </AnimateButton>
                  <AnimateButton>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => {
                        confirmDialog(
                          `Do you really want to delete the "${topic}" course calendar event?`,
                          () => mutateDelete({ date: new Date(date) })
                        );
                      }}
                    >
                      Delete
                    </Button>
                  </AnimateButton>
                </Stack>
              </Grid>
            )}
          </Grid>
        </Form>
      </MainCard>
      <ConfirmPopup />
    </>
  );
}

export default AgendaTopic;
