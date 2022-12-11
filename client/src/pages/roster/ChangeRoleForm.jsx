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
  const onSubmit = () => {
    mutate();
  };
  
  return (
    <Form onSubmit={onSubmit}>
      <Stack alignItems={"center"} direction={"column"} spacing={2}>
      {!isStaff && (
          <Typography variant="h4" align="center">
            Change Role to Staff or Instructor?
          </Typography>
        )}
        {isStaff && (
          <Typography variant="h4" align="center">
            Change Role to Student or Instructor?
          </Typography>
        )}
        <RadioGroup
          row
          name="row-radio-buttons-group"
          value={role}
          onChange={handleRoleChange}
        >
          {!isStaff && (
            <FormControlLabel value="Staff" control={<Radio />} label="Staff" />
          )}
           {isStaff && (
            <FormControlLabel value="Student" control={<Radio />} label="Student" />
          )}
          <FormControlLabel
            value="Instructor"
            control={<Radio />}
            label="Instructor"
          />
        </RadioGroup>
          <Button
            color="secondary"
            variant="contained"
            onClick={() => {
                if(onSubmit) {
                  onSubmit();
                }
            }}
          >
            Change
          </Button>
      </Stack>
    </Form>
  );
}

export default ChangeRoleForm;
