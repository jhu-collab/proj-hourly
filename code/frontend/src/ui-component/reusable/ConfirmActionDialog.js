import { useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import {
  RadioGroup,
  Radio,
  FormControl,
  FormControlLabel,
  Box,
  IconButton,
  DialogTitle,
  DialogContentText,
  DialogContent,
  DialogActions,
  Dialog,
} from '@mui/material';
import Button from './controls/Button';

/**
 * Given action text and action function, returns a mui Dialog component.
 * This reusable component has a clear close button, and an action Button.
 * Accepts option title and contentText to fill the Alert Dialog.
 * @param {*} props:
 * required: dialogActionText: the text on the action button of the dialog
 *           handleAction(option): the action to execute when the action button is clicked
 * optional: buttonText: the text on the button that opens the dialog
 *           dialogTitle: the text of the title on the dialog
 *           dialogContentText: the text on the content of the dialog
 *           options: a nested Array of [{value: ..., label: ...}, ...],
 *                    each {value, label} describing an option to be used in the Radio Dialog
 * @returns Dialog
 */
export default function ConfirmActionDialog(props) {
  const {
    dialogTitle,
    dialogContentText,
    dialogActionText,
    handleAction,
    options,
    open,
    setOpen,
  } = props;

  const [value, setValue] = useState(options ? options[0].value : '');

  const handleClose = () => {
    setOpen(false);
  };

  // Execute handleAction from props then close the dialog
  const handleActionClick = async () => {
    options ? await handleAction(value) : await handleAction();
    setOpen(false);
  };

  const handleChange = (event) => {
    setValue(event.target.value);
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
      <Dialog open={open} onClose={handleClose} disableEnforceFocus>
        <DialogTitle sx={{ m: 0, p: 2 }}>
          <Box display="flex" alignItems="center">
            <Box flexGrow={1}> {dialogTitle}</Box>
            <Box>
              <IconButton aria-label="close" onClick={handleClose}>
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          {dialogContentText ? (
            <DialogContentText>{dialogContentText}</DialogContentText>
          ) : null}
          {/* Create radio group of the options in options */}
          {options && (
            <FormControl>
              <RadioGroup value={value} onChange={handleChange}>
                {options.map((pair) => (
                  <FormControlLabel
                    value={pair.value}
                    control={<Radio />}
                    label={pair.label}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          )}
        </DialogContent>
        {/* Uses handleAction when clicked */}
        <DialogActions>
          <Button
            text={dialogActionText}
            onClick={handleActionClick}
            color="secondary"
            autoFocus
          />
        </DialogActions>
      </Dialog>
    </Box>
  );
}
