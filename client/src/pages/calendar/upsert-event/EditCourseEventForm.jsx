import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Form from "../../../components/form-ui/Form";
import FormInputText from "../../../components/form-ui/FormInputText";
import FormCheckbox from "../../../components/form-ui/FormCheckbox";
import Loader from "../../../components/Loader";
import { DateTime } from "luxon";
import useStoreEvent from "../../../hooks/useStoreEvent";
import useStoreToken from "../../../hooks/useStoreToken";
import useStoreCourse from "../../../hooks/useStoreCourse";
import useMutationEditCourseCalendarEvent from "../../../hooks/useMutationEditCourseCalendarEvent";
import { editCourseEventSchema } from "../../../utils/validators";

/**
 * Component that represents the form that is used to edit a course calendar event.
 * @returns A component representing the Edit Course Event form.
 */
function EditCourseEventForm() {
  const token = useStoreToken((state) => state.token);
  const course = useStoreCourse((state) => state.course);

  const title = useStoreEvent((state) => state.title);
  const date = useStoreEvent((state) => state.start);
  const newDate = useStoreEvent((state) => state.start);
  const location = useStoreEvent((state) => state.location);
  const resources = useStoreEvent((state) => state.resources);
  const remote = useStoreEvent((state) => state.isRemote);
  const isCancelled = useStoreEvent((state) => state.isCancelled);

  const { control, handleSubmit, watch } = useForm({
    defaultValues: {
      title: title || "",
      newDate: newDate
        ? DateTime.fromJSDate(newDate).toFormat("yyyy-MM-dd")
        : "",
      location: location || "",
      remote: remote || false,
      resources: resources || "",
    },
    resolver: yupResolver(editCourseEventSchema),
  });

  const { mutate, isLoading } = useMutationEditCourseCalendarEvent(false);

  const onSubmit = (data) => {
    const newDate = new Date(data.newDate);

    mutate({
      courseId: course.id,
      date: date.toISOString().split("T")[0],
      newDate: newDate.toISOString().split("T")[0],
      title: data.title,
      additionalInfo: data.resources,
      isCancelled: isCancelled,
      isRemote: data.remote,
      location: data.location,
    });
  };

  return (
    <>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Stack direction="column" alignItems="center" spacing={3}>
          <FormInputText
            name="title"
            control={control}
            label="Agenda Description"
          />
          <FormInputText
            name="newDate"
            control={control}
            label="Date"
            type="date"
            InputLabelProps={{ shrink: true }}
          />
          <FormInputText name="location" control={control} label="Location" />
          <FormCheckbox name="remote" control={control} label="Remote" />
          <FormInputText
            name="resources"
            control={control}
            label="Additional Resources (optional)"
            multiline
            rows={4}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            fullWidth
          >
            Update
          </Button>
        </Stack>
      </Form>
      {isLoading && <Loader />}
    </>
  );
}

export default EditCourseEventForm;
