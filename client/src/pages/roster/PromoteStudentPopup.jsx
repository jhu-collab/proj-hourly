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
import useMutationPromoteUser from "../../hooks/useMutationChangeRole";
import { toast } from "react-toastify";
function PromoteStudentPopup(props) {
  const {params, open, setOpen} = props;
  const handleClose = () => {
   setOpen(false);
  };
  const [role, setRole] = useState("");
  const handleRoleChange = (event) => setRole(event.target.value);

  
  const { mutate } = useMutationPromoteUser(params.id, role);

  const onSubmit = () => {
   
    mutate();
    handleClose();
    toast.success("Successfully promoted the user!");
  };
return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth >
      <DialogTitle variant="h4">
        <Typography variant="h4" align="center">Promote Student to Staff or Student?</Typography>
      </DialogTitle>
      <Stack alignItems={"center"} direction={"column"} spacing={2}>
        <RadioGroup
          row
          name="row-radio-buttons-group"
          value={role}
          onChange={handleRoleChange}
        >
          <FormControlLabel value="Staff" control={<Radio />} label="Staff" />
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
            if (onSubmit) {
              onSubmit();
            }
            handleClose();
          }}
        >
          Promote
        </Button>
      </DialogActions>
      </Stack>
    </Dialog>
  );
}

export default PromoteStudentPopup;