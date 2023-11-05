import Typography from "@mui/material/Typography";
import { useState } from "react";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import useMutationChangeRole from "../../hooks/useMutationChangeRole";
import Form from "../../components/form-ui/Form";

function ChangeRoleForm(props) {
  const { params, isStaff } = props;
  const [role, setRole] = useState("");

  const handleRoleChange = (event) => setRole(event.target.value);

  const { mutate } = useMutationChangeRole(params, role);
  const onSubmit = (e) => {
    e.preventDefault();
    mutate();
  };

  return (
    <Form data-cy="role-form" onSubmit={onSubmit}>
      <Stack data-cy="role-stack" alignItems={"center"} direction={"column"} spacing={2}>
        {!isStaff && (
          <Typography data-cy="student-role-title" variant="h4" align="center">
            Change Role to Staff or Instructor?
          </Typography>
        )}
        {isStaff && (
          <Typography data-cy="staff-role-title" variant="h4" align="center">
            Change Role to Student or Instructor?
          </Typography>
        )}
        <RadioGroup
          data-cy="role-choices-group"
          row
          name="row-radio-buttons-group"
          value={role}
          onChange={handleRoleChange}
        >
          {!isStaff && (
            <FormControlLabel 
              data-cy="to-staff-label" 
              value="Staff" 
              control={<Radio />} 
              label="Staff" 
            />
          )}
          {isStaff && (
            <FormControlLabel
              data-cy="to-student-label"
              value="Student"
              control={<Radio />}
              label="Student"
            />
          )}
          <FormControlLabel
            data-cy="to-instructor-label"
            value="Instructor"
            control={<Radio />}
            label="Instructor"
          />
        </RadioGroup>
        <Button data-cy="confirm-role-change-button" color="secondary" variant="contained" type="submit">
          Change
        </Button>
      </Stack>
    </Form>
  );
}

export default ChangeRoleForm;
