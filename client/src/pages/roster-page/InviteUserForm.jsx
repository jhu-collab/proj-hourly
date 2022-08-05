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

function InviteUserForm(props) {
  const { isInstructor } = props;
  const [role, setRole] = useState("");
  const [open, setOpen] = useState(false);
  //const [checked, setChecked] = useState(preSelect);

  const handleClose = () => {
    NiceModal.hide("invite-user");
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
            //   checked={checked == 0}
            //   onChange={() => setChecked(0)}
          />
          <FormControlLabel
            value="staff"
            control={<Radio />}
            label="Staff"
            //   checked={checked == 1}
            //   onChange={() => setChecked(1)}
          />
          <FormControlLabel
            value="instructor"
            control={<Radio />}
            label="Instructor"
            disabled={!isInstructor}
            //   checked={isInstructor && checked == 2}
            //   onChange={() => setChecked(2)}
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

export default InviteUserForm;
