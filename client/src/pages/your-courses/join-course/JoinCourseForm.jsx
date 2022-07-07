import { yupResolver } from "@hookform/resolvers/yup";
import React from "react";
import { useForm } from "react-hook-form";
import Form from "../../../components/form-ui/Form";
import FormInputText from "../../../components/form-ui/FormInputText";
import { joinCourseSchema } from "./validation";

function JoinCourseForm() {
  const { control, handleSubmit } = useForm({
    defaultValues: {
      courseCode: "",
    },
    resolver: yupResolver(joinCourseSchema),
  });

  return (
    <Form>
      <FormInputText
        name="courseCode"
        label="Course Code"
        control={control}
      ></FormInputText>
    </Form>
  );
}

export default JoinCourseForm;
