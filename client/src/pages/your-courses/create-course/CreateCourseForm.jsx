import { Button, Stack, TextField, useMediaQuery, useTheme } from "@mui/material";
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { Form } from "../../../components/form-ui/Form";
import { FormInputText } from "../../../components/form-ui/FormInputText";
import { yupResolver } from '@hookform/resolvers/yup';
import { createCourseSchema } from "./validation";

function CreateCourseForm() {
  const theme = useTheme();

  const { control, handleSubmit } = useForm({
    defaultValues: {
      title: "",
      number: "",
      semester: "",
      year: "",
    },
    resolver: yupResolver(createCourseSchema)
  });

  const onSubmit = (data) => console.log(data);

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Stack direction="column" spacing={theme.spacing(3)}>
        <FormInputText name="title" control={control} label="Course Title" />
        <FormInputText name="number" control={control} label="Course Number" />
        <FormInputText name="semester" control={control} label="Semester" />
        <FormInputText name="year" control={control} label="Year" />
        <Button type="submit" variant="contained" fullWidth>Create</Button>
      </Stack>
    </Form>
  );
}

export default CreateCourseForm;
