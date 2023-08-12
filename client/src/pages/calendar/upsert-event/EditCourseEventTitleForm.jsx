import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Form from "../../../components/form-ui/Form";
import FormInputText from "../../../components/form-ui/FormInputText";
import Loader from "../../../components/Loader";
import useMutationEditCourseCalendarEventTitle from "../../../hooks/useMutationEditCourseCalendarEventTitle";
import useStoreEvent from "../../../hooks/useStoreEvent";
import useStoreToken from "../../../hooks/useStoreToken";
import useStoreCourse from "../../../hooks/useStoreCourse";
import { editTitleSchema } from "../../../utils/validators";

/**
 * Component that represents the form that is used to edit a course calendar event's title.
 * @returns A component representing the Edit Course Event Title form.
 */
function EditCourseEventTitleForm() {
  const token = useStoreToken((state) => state.token);
  const course = useStoreCourse((state) => state.course);
  const date = useStoreEvent((state) => state.start);
  const title = useStoreEvent((state) => state.title);

  const { control, handleSubmit } = useForm({
    defaultValues: {
      title: title || "",
    },
    resolver: yupResolver(editTitleSchema),
  });

  const { mutate, isLoading } = useMutationEditCourseCalendarEventTitle();

  const onSubmit = (data) => {
    mutate({
      courseId: course.id,
      date: date.toISOString().split('T')[0],
      title: data.title,
    });
  };

  return (
    <>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Stack direction="column" alignItems="center" spacing={3}>
          <Stack direction="row" sx={{ width: "100%" }} spacing={3}>
          </Stack>
          <FormInputText 
            name="title" 
            control={control} 
            label="Agenda Description" 
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

export default EditCourseEventTitleForm;