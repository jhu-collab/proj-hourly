import { yupResolver } from "@hookform/resolvers/yup";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { useForm } from "react-hook-form";
import AnimateButton from "../../components/AnimateButton";
import Form from "../../components/form-ui/Form";
import FormInputText from "../../components/form-ui/FormInputText";
import useMutationCreateRegType from "../../hooks/useMutationCreateRegType";
import { registrationTypeSchema } from "../../utils/validators";

/**
 * Component that represents the form that is used to create a
 * registration type.
 * @returns A component representing the Create Registration Type form.
 */
function CreateRegistrationTypeForm() {
  const { mutate } = useMutationCreateRegType();

  const { control, handleSubmit } = useForm({
    defaultValues: {
      title: "",
      length: "",
    },
    resolver: yupResolver(registrationTypeSchema),
  });

  const onSubmit = (data) => {
    mutate({ title: data.title, length: data.length });
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={2} alignItems="center">
        <FormInputText name="title" control={control} label="Name" />
        <FormInputText
          name="length"
          control={control}
          label="Duration (minutes)"
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

export default CreateRegistrationTypeForm;
