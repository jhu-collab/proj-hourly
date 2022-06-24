import { Link } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import {
  Dialog,
  DialogContent,
  Divider,
  Grid,
  Stack,
  Typography,
  useMediaQuery,
} from '@mui/material';
import AuthWrapper1 from 'views/pages/authentication/AuthWrapper1';
import AuthCardWrapper from 'views/pages/authentication/AuthCardWrapper';
import AuthLogin from 'views/pages/authentication/auth-forms/AuthLogin';
import Logo from 'ui-component/Logo';
import AuthFooter from 'ui-component/cards/AuthFooter';
import { useStore } from 'store/appStore';

// project imports

// assets

// ================================|| AUTH3 - LOGIN ||================================ //

const CreateCourse = () => {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('md'));

  const open = useStore((state) => state.createPopup);
  const onClose = useStore((state) => state.createPopupClose);

  return (
    <Dialog onclose={onClose} open={open}>
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
                      <AuthLogin />
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
