import { useState } from "react";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import Form from "../../components/form-ui/Form";
import FormInputText from "../../components/form-ui/FormInputText";
import NiceModal from "@ebay/nice-modal-react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { inviteUserSchema } from "../../utils/validators";

function PromoteUserForm(props) {
  const { isInstructor } = props;
  const [role, setRole] = useState("");

  const handleClose = () => {
    NiceModal.hide("promote-user");
  };

  const { control, handleSubmit } = useForm({
    defaultValues: {
      email: "",
    },
    resolver: yupResolver(inviteUserSchema),
  });
  const handleRoleChange = (event) => setRole(event.target.value);

  const onSubmit = () => {
    handleClose();
    toast.success("Successfully invited the user");
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Stack alignItems={"center"} direction={"column"} spacing={2}>
        <FormInputText name="email" control={control} label="Email Address" />
        <RadioGroup
          row
          name="row-radio-buttons-group"
          value={role}
          onChange={handleRoleChange}
        >
          <FormControlLabel
            value="student"
            control={<Radio />}
            label="Student"
          />
          <FormControlLabel value="staff" control={<Radio />} label="Staff" />
          <FormControlLabel
            value="instructor"
            control={<Radio />}
            label="Instructor"
            disabled={!isInstructor}
          />
        </RadioGroup>
        <Button
          sx={{ margin: 2, fontSize: 17 }}
          variant="contained"
          type="submit"
        >
          Add User
        </Button>
      </Stack>
    </Form>
  );
}

export default PromoteUserForm;
