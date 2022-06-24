// material-ui
import { useTheme } from '@mui/material/styles';
import {
  Dialog,
  DialogContent,
  Grid,
  Stack,
  Typography,
  useMediaQuery,
} from '@mui/material';

// project imports
import { useStore } from 'store/appStore';
import CreateCourseForm from './CreateCourseForm';

// assets

// ================================|| CREATE COURSE ||================================ //

const CreateCourse = () => {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('md'));

  const open = useStore((state) => state.createPopup);
  const onClose = useStore((state) => state.createPopupClose);

  return (
    <Dialog onClose={onClose} open={open}>
        <DialogContent>
        <Grid
          container
          direction="column"
          justifyContent="flex-end"
          >
          <Grid item xs={12}>
            <Grid
              container
              justifyContent="center"
              alignItems="center"
              >
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
                              variant={matchDownSM ? 'h2' : 'h1'}>
                              Create Course
                            </Typography>
                          </Stack>
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item xs={12}>
                      <CreateCourseForm />
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

export default CreateCourse;
