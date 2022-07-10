import { yupResolver } from "@hookform/resolvers/yup";
import { Box, Button, Stack } from "@mui/material";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import Form from "../../../components/form-ui/Form";
import FormInputText from "../../../components/form-ui/FormInputText";
import { joinCourseSchema } from "../../../utils/validators";

/**
 * Component that represents the form that is used to join a course.
 * @param {*} handlePopupToggle: function that toggles whether the popup is open
 * @returns A component representing the Join Course form.
 */
function JoinCourseForm({ onClose }) {
  const { control, handleSubmit } = useForm({
    defaultValues: {
      courseCode: "",
    },
    resolver: yupResolver(joinCourseSchema),
  });

  const onSubmit = (data) => {
    console.log(data);
    onClose();
    toast.success("Successfully joined XXX course"); // TODO: replace "XXX" with actual course name once backend is connected
  };
  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Stack direction="column" spacing={3}>
        <FormInputText
          name="courseCode"
          label="Course Code"
          control={control}
        ></FormInputText>
        <Button variant="contained" fullWidth type="submit">
          Submit
        </Button>
      </Stack>
    </Form>
  );
}

export default JoinCourseForm;
