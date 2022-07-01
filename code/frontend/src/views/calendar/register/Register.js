// material-ui
import { useTheme } from '@mui/material/styles';
import {
  Button,
  Dialog,
  DialogContent,
  Grid,
  Stack,
  Typography,
  useMediaQuery,
} from '@mui/material';

// project imports
import { useStore } from 'store/appStore';

// assets

// ================================|| CREATE COURSE ||================================ //

/**
 * A MUI Dialog that allows the user to a create a course.
 * @returns The Create Course Popup.
 */
const Register = (props) => {

  const { title } = props;

  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('md'));

  const open = useStore((state) => state.registerPopup);
  const onClose = useStore((state) => state.setRegisterPopupClose);

  const onClick = () => {
    onClose();
    alert("Successfully registered!");
  }

  return (
    <Dialog onClose={onClose} open={open}>
      <DialogContent>
        <Grid container direction="column" justifyContent="flex-end">
          <Grid item xs={12}>
            <Grid container justifyContent="center" alignItems="center">
              <Grid item sx={{ m: { xs: 1, sm: 3 }, mb: 0 }}>
                <Grid
                  container
                  spacing={2}
                  alignItems="center"
                  justifyContent="center">
                  <Grid item xs={12}>
                    <Grid
                      container
                      direction={matchDownSM ? 'column-reverse' : 'row'}
                      alignItems="center"
                      justifyContent="center">
                      <Grid item>
                        <Stack
                          alignItems="center"
                          justifyContent="center"
                          spacing={1}>
                          <Typography
                            color={theme.palette.secondary.main}
                            gutterBottom
                            align="center"
                            variant={matchDownSM ? 'h3' : 'h2'}>
                            Do you want to register for {title}?
                          </Typography>
                        </Stack>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item container justifyContent="center" xs={12}>
                    <Button variant="contained" color="secondary" onClick={onClick}>Sign Up!</Button>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default Register;
