import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import Form from "../../components/form-ui/Form";
import FormInputText from "../../components/form-ui/FormInputText";
import Popup from "../../components/Popup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { inviteUserSchema } from "../../utils/validators";
import { toast } from "react-toastify";
import { useState } from "react";

/**
 * Represents a Material UI Card component that allows staff to add users.
 * @param {*} props - Properties include onClose, open, id, token.
 * @returns A card for adding user.
 */
function InviteUser(props) {
  const { id, isInstructor, token, preSelect } = props;
  const [role, setRole] = useState("");
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState(preSelect);
  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    //need to fetch users here
    setOpen(false);
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
    <>
      <Button
        sx={{ margin: 0, fontSize: 17, justifyContent: "flex-end" }}
        onClick={handleOpen}
        variant="contained"
      >
        Invite User
      </Button>
      <Popup onClose={handleClose} open={open} title="Invite User">
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Stack alignItems={"center"} direction={"column"} spacing={2}>
            <FormInputText
              name="email"
              control={control}
              label="Email Address"
            />
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
                checked={checked == 0}
                onChange={() => setChecked(0)}
              />
              <FormControlLabel
                value="staff"
                control={<Radio />}
                label="Staff"
                checked={checked == 1}
                onChange={() => setChecked(1)}
              />
              <FormControlLabel
                value="instructor"
                control={<Radio />}
                label="Instructor"
                disabled={!isInstructor}
                checked={isInstructor && checked == 2}
                onChange={() => setChecked(2)}
              />
            </RadioGroup>
            <Button
              sx={{ margin: 2, fontSize: 17 }}
              onClick={handleOpen}
              variant="contained"
              type="submit"
            >
              Add User
            </Button>
          </Stack>
        </Form>
      </Popup>
    </>
  );
}

export default InviteUser;
