import NiceModal from "@ebay/nice-modal-react";
import { yupResolver } from "@hookform/resolvers/yup";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { useForm } from "react-hook-form";
import AnimateButton from "../../components/AnimateButton";
import Form from "../../components/form-ui/Form";
import FormInputText from "../../components/form-ui/FormInputText";
import { topicSchema } from "../../utils/validators";

function CreateTopicForm() {
  const { control, handleSubmit } = useForm({
    defaultValues: {
      name: "",
    },
    resolver: yupResolver(topicSchema),
  });

  const onSubmit = (data) => {
    NiceModal.hide("create-topic");
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
