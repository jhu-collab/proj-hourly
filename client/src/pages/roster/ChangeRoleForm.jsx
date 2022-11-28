import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import useMutationChangeRole from "../../hooks/useMutationChangeRole";
import NiceModal from "@ebay/nice-modal-react";

function ChangeRoleForm(props) {
  const { params, isStaff } = props;
  const [role, setRole] = useState("");

  const handleClose = () => {
    NiceModal.hide("change-user-role");
  };

  const handleRoleChange = (event) => setRole(event.target.value);

  const { mutate } = useMutationChangeRole(params, role);
  const onSubmit = () => {
    mutate();
    handleClose();
  };
  
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle variant="h4">
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
      </DialogTitle>
      <Stack alignItems={"center"} direction={"column"} spacing={2}>
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
        <DialogActions>
          <Button color="primary" variant="contained" onClick={handleClose}>
            Cancel
          </Button>
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
        </DialogActions>
      </Stack>
    </Dialog>
  );
}

export default ChangeRoleForm;
