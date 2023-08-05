import { yupResolver } from "@hookform/resolvers/yup";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { useForm } from "react-hook-form";
import AnimateButton from "../../components/AnimateButton";
import Form from "../../components/form-ui/Form";
import FormInputText from "../../components/form-ui/FormInputText";
import { tokenSchema } from "../../utils/validators";
import useStoreCourse from "../../hooks/useStoreCourse";
import useMutationCreateToken from "../../hooks/useMutationCreateToken";

/**
 * Component that represents the form that is used to create a
 * topic.
 * @returns A component representing the Create Topic form.
 */
function CreateTopicForm() {
  const { mutate } = useMutationCreateToken();
  const course = useStoreCourse((state) => state.course);

  const { control, handleSubmit } = useForm({
    defaultValues: {
      name: "",
      description: "",
      quantity: 0,
    },
    resolver: yupResolver(tokenSchema),
  });

  const onSubmit = (data) => {
    mutate({
      courseId: course.id,
      name: data.name,
      description: data.description,
      quantity: data.quantity,
    });
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={2} alignItems="center">
        <FormInputText name="name" control={control} label="Name" />
        <FormInputText
          name="description"
          control={control}
          label="Description"
        />
        <FormInputText
          name="quantity"
          control={control}
          label="Quantity"
          type="number"
        />
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
