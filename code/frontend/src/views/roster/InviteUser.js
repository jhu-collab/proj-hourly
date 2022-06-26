import React from 'react';
import { IconButton } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import axios from 'axios';
import validator from 'validator';
import {
  Dialog,
  DialogContent,
  Grid,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import Button from '../../ui-component/reusable/controls/Button';
import { Form, useForm } from '../../ui-component/reusable/Form';
import Controls from '../../ui-component/reusable/controls/Controls';

/**
 * Represents a Material UI Card component that allows staff to add users.
 * @param {*} props - Properties include onClose, open, id, token.
 * @returns A card for adding user.
 */
function InviteUser(props) {
  const { id, isInstructor, token } = props;
  const [role, setRole] = React.useState('');
  const [open, setOpen] = React.useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    //need to fetch users here
    setOpen(false);
  };

  const handleRoleChange = (event) => setRole(event.target.value);

  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };

  // Validation function to check if fields are correctly formatted.
  const validate = (fields = values) => {
    let temp = { ...errors };
    if ('email' in fields)
      temp.email = validator.isEmail(fields.email)
        ? ''
        : 'Please include a valid email.';

    setErrors({
      ...temp,
    });

    if (fields === values) return Object.values(temp).every((x) => x === '');
  };

  const initialFValues = {
    email: '',
  };

  const { values, errors, setErrors, handleInputChange } = useForm(
    initialFValues,
    false,
    validate,
  );

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (validate()) {
      await axios
        .post(
          `/api/courses/${id}/roster`,
          { email: values.email, role },
          config,
        )
        .then(() => {
          handleClose();
        })
        .catch((err) => {});
    }
  };

  const styles = {
    dialog: {
      height: '365px',
    },
    input: {
      width: '400px',
    },
    addButton: {
      width: '200px',
    },
  };

  return (
    <>
      <Button
        text="Invite User"
        margin="0px"
        fontSize="17px"
        onClick={handleOpen}
        other={{ justifyContent: 'flex-end' }}
      />
      <Dialog onClose={handleClose} open={open} disableEnforceFocus>
        <DialogContent style={styles.dialog}>
          <Grid direction="column" container>
            <Grid container justifyContent="flex-end">
              <IconButton onClick={handleClose}>
                <ClearIcon />
              </IconButton>
            </Grid>
            <Grid
              direction="column"
              container
              spacing={3}
              justifyContent="center"
              alignItems="center"
            >
              <Grid item>
                <h1>Add a User</h1>
              </Grid>
              <Grid item md="auto">
                <Form onSubmit={handleSubmit}>
                  <Controls.InputText
                    label="Email"
                    name="email"
                    value={values.email}
                    error={errors.email}
                    onChange={handleInputChange}
                    width="350px"
                    margin="0px"
                  />
                  <Grid container justifyContent="center">
                    <Grid item>
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
                        <FormControlLabel
                          value="staff"
                          control={<Radio />}
                          label="Staff"
                        />
                        <FormControlLabel
                          value="instructor"
                          control={<Radio />}
                          label="Instructor"
                          disabled={!isInstructor}
                        />
                      </RadioGroup>
                    </Grid>
                  </Grid>

                  <Grid container justifyContent="center">
                    <Grid item>
                      <Controls.Button text="Add" type="submit" />
                    </Grid>
                  </Grid>
                </Form>
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default InviteUser;
