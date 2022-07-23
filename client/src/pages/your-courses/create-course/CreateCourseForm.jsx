import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import useTheme from "@mui/material/styles/useTheme";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { createCourseSchema } from "../../../utils/validators";
import FormInputDropdown from "../../../components/form-ui/FormInputDropdown";
import Form from "../../../components/form-ui/Form";
import FormInputText from "../../../components/form-ui/FormInputText";
import { toast } from "react-toastify";
import { useMutation, useQueryClient } from "react-query";
import Loader from "../../../components/Loader";
import { createCourse } from "../../../utils/requests";
import useStore from "../../../services/store";
import { errorToast } from "../../../utils/toasts";

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
 * @param {*} handlePopupToggle: function that toggles whether the popup is open
 * @returns A component representing the Create Course form.
 */
function CreateCourseForm({ handlePopupToggle }) {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const { userId } = useStore();

  const { control, handleSubmit } = useForm({
    defaultValues: {
      title: "",
      number: "",
      semester: "",
      year: "",
    },
    resolver: yupResolver(createCourseSchema),
  });

  const { mutate, isLoading } = useMutation(createCourse, {
    onSuccess: (data) => {
      const course = data.course;

      queryClient.invalidateQueries(["courses"]);
      handlePopupToggle();
      toast.success(
        `Successfully created the ${course.title} course for ${course.semester} ${course.calendarYear}`
      );
    },
    onError: (error) => {
      errorToast(error);
    },
  });

  const onSubmit = (data) => {
    mutate({ ...data, id: userId });
  };

  return (
    <>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Stack direction="column" spacing={theme.spacing(3)}>
          <FormInputText name="title" control={control} label="Course Title" />
          <FormInputText
            name="number"
            control={control}
            label="Course Number"
          />
          <FormInputDropdown
            name="semester"
            control={control}
            label="Semester"
            options={options}
          />
          <FormInputText name="year" control={control} label="Year" />
          <Button type="submit" variant="contained" fullWidth>
            Create
          </Button>
        </Stack>
      </Form>
      {isLoading && <Loader />}
    </>
  );
}

export default CreateCourseForm;
