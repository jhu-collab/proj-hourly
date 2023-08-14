import { editLocationSchema } from "../../../utils/validators";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Form from "../../../components/form-ui/Form";
import FormInputText from "../../../components/form-ui/FormInputText";
import Loader from "../../../components/Loader";
import FormCheckbox from "../../../components/form-ui/FormCheckbox";
import useMutationEditCourseCalendarEventLocation from "../../../hooks/useMutationEditCourseCalendarEventLocation";
import useStoreEvent from "../../../hooks/useStoreEvent";
import useStoreToken from "../../../hooks/useStoreToken";
import { decodeToken } from "react-jwt";
import useStoreCourse from "../../../hooks/useStoreCourse";

/**
 * Component that represents the form that is used to edit a course calendar event's location.
 * @returns A component representing the Edit Course Event Location form.
 */
function EditCourseEventLocationForm() {
  const token = useStoreToken((state) => state.token);
  const course = useStoreCourse((state) => state.course);
  const date = useStoreEvent((state) => state.start);
  const location = useStoreEvent((state) => state.location);
  const isRemote = useStoreEvent((state) => state.isRemote);

  const { control, handleSubmit, watch } = useForm({
    defaultValues: {
      remote: isRemote,
      location: location || "",
    },
    resolver: yupResolver(editLocationSchema),
  });

  const { mutate, isLoading } = useMutationEditCourseCalendarEventLocation();

  const onSubmit = (data) => {
    mutate({
      courseId: course.id,
      date: date.toISOString().split("T")[0],
      location: data.location,
      isRemote: data.isRemote,
    });
  };

  return (
    <>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Stack direction="column" alignItems="center" spacing={3}>
          <Stack direction="row" sx={{ width: "100%" }} spacing={3}></Stack>
          <FormInputText name="location" control={control} label="Location" />
          <FormCheckbox name="remote" control={control} label="Remote" />
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

export default EditCourseEventLocationForm;
