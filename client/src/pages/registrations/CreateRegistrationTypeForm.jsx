import NiceModal from "@ebay/nice-modal-react";
import { yupResolver } from "@hookform/resolvers/yup";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { useForm } from "react-hook-form";
import AnimateButton from "../../components/AnimateButton";
import Form from "../../components/form-ui/Form";
import FormInputText from "../../components/form-ui/FormInputText";
import { registrationTypeSchema } from "../../utils/validators";

function CreateRegistrationTypeForm() {
  const { control, handleSubmit } = useForm({
    defaultValues: {
      name: "",
      duration: "",
    },
    resolver: yupResolver(registrationTypeSchema),
  });

  // TODO: Need a route that allows for the creation of a registration
  // type
  const onSubmit = (data) => {
    window.alert("Successfully created new registration type!");
    NiceModal.hide("create-registration-type");
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={2} alignItems="center">
        <FormInputText name="name" control={control} label="Name" />
        <FormInputText
          name="duration"
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
