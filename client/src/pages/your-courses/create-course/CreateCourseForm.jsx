import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { createCourseSchema } from "../../../utils/validators";
import FormInputDropdown from "../../../components/form-ui/FormInputDropdown";
import Form from "../../../components/form-ui/Form";
import FormInputText from "../../../components/form-ui/FormInputText";
import { staffCourses } from "../courses-data";
import { toast } from "react-toastify";

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

  const { control, handleSubmit } = useForm({
    defaultValues: {
      title: "",
      courseNumber: "",
      semester: "",
      calendarYear: "",
    },
    resolver: yupResolver(createCourseSchema),
  });

  const onSubmit = (data) => {
    console.log(data);
    staffCourses.push({
      id: 10,
      title: data.title,
      courseNumber: data.courseNumber,
      semester: data.semester,
      calendarYear: data.calendarYear,
      code: "ABCABC",
    });
    handlePopupToggle();
    toast.success(
      `Successfully created the ${data.title} course for ${data.semester} ${data.calendarYear}`
    );
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Stack direction="column" spacing={theme.spacing(3)}>
        <FormInputText name="title" control={control} label="Course Title" />
        <FormInputText
          name="courseNumber"
          control={control}
          label="Course Number"
        />
        <FormInputDropdown
          name="semester"
          control={control}
          label="Semester"
          options={options}
        />
        <FormInputText name="calendarYear" control={control} label="Year" />
        <Button type="submit" variant="contained" fullWidth>
          Create
        </Button>
      </Stack>
    </Form>
  );
}

export default CreateCourseForm;
