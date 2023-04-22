import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import useTheme from "@mui/material/styles/useTheme";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { createCourseSchema } from "../../../utils/validators";
import FormInputDropdown from "../../../components/form-ui/FormInputDropdown";
import Form from "../../../components/form-ui/Form";
import FormInputText from "../../../components/form-ui/FormInputText";
import Loader from "../../../components/Loader";
import { decodeToken } from "react-jwt";
import useMutationCreateCourse from "../../../hooks/useMutationCreateCourse";
import useStoreToken from "../../../hooks/useStoreToken";

const options = [
  {
    id: "1",
    label: "Fall",
    value: "Fall",
  },
  {
    id: "2",
    label: "Winter",
    value: "Winter",
  },
  {
    id: "3",
    label: "Spring",
    value: "Spring",
  },
  {
    id: "4",
    label: "Summer",
    value: "Summer",
  },
];

/**
 * Component that represents the form that is used to create a course.
 * @returns A component representing the Create Course form.
 */
function CreateCourseForm() {
  const theme = useTheme();
  const token = useStoreToken((state) => state.token);
  const { id } = decodeToken(token);

  const { control, handleSubmit } = useForm({
    defaultValues: {
      title: "",
      number: "",
      semester: "",
      year: "",
    },
    resolver: yupResolver(createCourseSchema),
  });

  const { mutate, isLoading } = useMutationCreateCourse();

  const onSubmit = (data) => {
    mutate({ ...data, id: id });
  };

  return (
    <>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Stack direction="column" spacing={theme.spacing(3)}>
          <FormInputText
            data-cy="course-title-input"
            name="title"
            control={control}
            label="Course Title"
          />
          <FormInputText
            data-cy="course-number-input"
            name="number"
            control={control}
            label="Course Number"
          />
          <FormInputDropdown
            data-cy="course-semester-input"
            name="semester"
            control={control}
            label="Semester"
            options={options}
          />
          <FormInputText
            data-cy="course-year-input"
            name="year"
            control={control}
            label="Year"
          />
          <Button
            data-cy="create-button"
            type="submit"
            variant="contained"
            fullWidth
          >
            Create
          </Button>
        </Stack>
      </Form>
      {isLoading && <Loader />}
    </>
  );
}

export default CreateCourseForm;
