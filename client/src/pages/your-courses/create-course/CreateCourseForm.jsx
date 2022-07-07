import { Button, Stack, useTheme } from "@mui/material";
import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { createCourseSchema } from "./validation";
import FormInputDropdown from "../../../components/form-ui/FormInputDropdown";
import Form from "../../../components/form-ui/Form";
import FormInputText from "../../../components/form-ui/FormInputText";

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

function CreateCourseForm({ handlePopupToggle }) {
  const theme = useTheme();

  const { control, handleSubmit } = useForm({
    defaultValues: {
      title: "",
      number: "",
      semester: "",
      year: "",
    },
    resolver: yupResolver(createCourseSchema),
  });

  const onSubmit = (data) => {
    console.log(data);
    handlePopupToggle();
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Stack direction="column" spacing={theme.spacing(3)}>
        <FormInputText name="title" control={control} label="Course Title" />
        <FormInputText name="number" control={control} label="Course Number" />
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
  );
}

export default CreateCourseForm;
