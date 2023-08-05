import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Form from "../../components/form-ui/Form";
import FormInputText from "../../components/form-ui/FormInputText";
import Loader from "../../components/Loader";
import FormToggleButtonGroup from "../../components/form-ui/FormToggleButtonGroup";
import FormCheckbox from "../../components/form-ui/FormCheckbox";
import { decodeToken } from "react-jwt";
import useStoreToken from "../../hooks/useStoreToken";
import useStoreCourse from "../../hooks/useStoreCourse";
import useMutationCourseTokenOptIn from "../../hooks/useMutationCourseTokenOptIn";
//import { optInCourseTokenSchema } from "../../utils/validators";

/**
 * Component that represents the form that is used to create a lecture.
 * @returns A component representing the LectureEvent form.
 */

function CourseTokenOptInForm() {
  const token = useStoreToken((state) => state.token);
  const { id } = decodeToken(token);

  const course = useStoreCourse((state) => state.course);

  const { control, handleSubmit, watch } = useForm({
    defaultValues: {
      optIn: course.usesTokens,
    },
    //resolver: yupResolver(optInCourseTokenSchema),
  });

  const recurring = watch("recurringEvent");

  const { mutate, isLoading } = useMutationCourseTokenOptIn();

  const onSubmit = (data) => {
    mutate({
      courseId: course.id,
    });
  };

  return (
    <>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Stack direction="column" alignItems="center" spacing={3}>
          <Stack direction="row" spacing={3} alignItems="center">
            <FormCheckbox
              name="optIn"
              control={control}
              label="Enable Course Tokens"
            />
          </Stack>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            fullWidth
          >
            Submit
          </Button>
        </Stack>
      </Form>
      {isLoading && <Loader />}
    </>
  );
}

export default CourseTokenOptInForm;
