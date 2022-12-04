import { yupResolver } from "@hookform/resolvers/yup";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { useForm } from "react-hook-form";
import AnimateButton from "../../components/AnimateButton";
import Form from "../../components/form-ui/Form";
import FormInputText from "../../components/form-ui/FormInputText";
import useMutationCreateTopic from "../../hooks/useMutationCreateTopic";
import { topicSchema } from "../../utils/validators";
import useStoreCourse from "../../hooks/useStoreCourse";

/**
 * Component that represents the form that is used to create a
 * topic.
 * @returns A component representing the Create Topic form.
 */
function CreateTopicForm() {
  const { mutate } = useMutationCreateTopic();
  const course = useStoreCourse((state) => state.course);

  const { control, handleSubmit } = useForm({
    defaultValues: {
      name: "",
    },
    resolver: yupResolver(topicSchema),
  });

  const onSubmit = (data) => {
    mutate({ courseId: course.id, value: data.name });
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={2} alignItems="center">
        <FormInputText name="name" control={control} label="Name" />
        <AnimateButton>
          <Button type="submit" variant="contained" size="large">
            Create
          </Button>
        </AnimateButton>
      </Stack>
    </Form>
  );
}

export default CreateTopicForm;
