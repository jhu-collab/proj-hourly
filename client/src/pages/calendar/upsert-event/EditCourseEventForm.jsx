import { createEventSchema } from "../../../utils/validators";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Form from "../../../components/form-ui/Form";
import FormInputText from "../../../components/form-ui/FormInputText";
import Loader from "../../../components/Loader";
import { DateTime } from "luxon";
import useStoreEvent from "../../../hooks/useStoreEvent";
import useStoreToken from "../../../hooks/useStoreToken";
import { decodeToken } from "react-jwt";
import useStoreCourse from "../../../hooks/useStoreCourse";
import useMutationEditCourseCalendarEvent from "../../../hooks/useMutationEditCourseCalendarEvent";

/**
 * Component that represents the form that is used to edit a course event.
 * @returns A component representing the Edit Course Event form.
 */
function EditCourseEventForm() {
  
  const token = useStoreToken((state) => state.token);
  const { id } = decodeToken(token);
  const course = useStoreCourse((state) => state.course);
  
  const title = useStoreEvent((state) => state.title);
  const date = useStoreEvent((state) => state.start);
  const newDate = useStoreEvent((state) => state.start);
  const location = useStoreEvent((state) => state.location);
  const resources = useStoreEvent((state) => state.resources);

  const { control, handleSubmit, watch } = useForm({
    defaultValues: {
      title: title || "",
      newDate: newDate ? DateTime.fromJSDate(newDate).toFormat("yyyy-MM-dd") : "",
      location: location || "",
      resources: resources || "",
    },
    /*resolver: yupResolver(createEventSchema),*/ // TODO: UPDATE THIS
  });

  const { mutate, isLoading } = useMutationEditCourseCalendarEvent(false);

  // TODO: UPDATE THIS
  const onSubmit = (data) => {
    const newDate = new Date(data.newDate);

    mutate({
      courseId: course.id,
      date: date.toISOString().split('T')[0],
      newDate: newDate.toISOString(),
      title: data.title,
      additionalInfo: data.resources,
      isCancelled: false,
      isRemote: false, // TODO
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
