// material-ui
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  OutlinedInput,
  useMediaQuery,
} from '@mui/material';

// third party
import * as Yup from 'yup';
import { Formik } from 'formik';

// project imports
import useScriptRef from 'hooks/useScriptRef';
import AnimateButton from 'ui-component/extended/AnimateButton';
import { useStore } from 'store/appStore';

// ============================|| CREATE COURSE FORM ||============================ //

/**
 * The form that is utilized to create a course.
 * @returns A create course form.
 */
const CreateEventForm = ({ ...others }) => {
  const theme = useTheme();
  const scriptedRef = useScriptRef();
  const createEvent = useStore((state) => state.createEvent);
  const createEventPopupClose = useStore(
    (state) => state.createEventPopupClose,
  );

  const matchDownMd = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <>
      <Formik
        initialValues={{
          eventName: '', // Once backend is set up, this will be removed
          date: '',
          startTime: '',
          endTime: '',
          location: '',
        }}
        validationSchema={Yup.object().shape({
          eventName: Yup.string().required('Event name is required'),
          // TODO: Need to add further validation for start date (not before current date, etc.)
          date: Yup.string().required('Date is required'),
          // TODO: Need to add further validation for start time (not before current time, not after end time, etc.)
          startTime: Yup.string().required('Start time is required'),
          // TODO: Need to add further validation for end time (not before current time, not before start time, etc.)
          endTime: Yup.string().required('End time is required'),
          location: Yup.string().required('Location is required'),
        })}
        onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
          try {
            if (scriptedRef.current) {
              setStatus({ success: true });
              setSubmitting(false);
              const event = {
                title: values.eventName,
                start: `${values.date}T${values.startTime}`,
                end: `${values.date}T${values.endTime}`,
                location: values.location,
              };
              createEvent(event);
              createEventPopupClose();
            }
          } catch (err) {
            console.error(err);
            if (scriptedRef.current) {
              setStatus({ success: false });
              setErrors({ submit: err.message });
              setSubmitting(false);
            }
          }
        }}
      >
        {({
          errors,
          handleBlur,
          handleChange,
          handleSubmit,
          isSubmitting,
          touched,
          values,
        }) => (
          <form noValidate onSubmit={handleSubmit} {...others}>
            <FormControl
              fullWidth
              error={Boolean(touched.eventName && errors.eventName)}
              sx={{ ...theme.typography.customInput }}
            >
              <InputLabel htmlFor="outlined-adornment-event-name">
                Event Name
              </InputLabel>
              <OutlinedInput
                id="outlined-adornment-event-name"
                type="text"
                value={values.eventName}
                name="eventName"
                onBlur={handleBlur}
                onChange={handleChange}
                label="Event Name"
                inputProps={{}}
              />
              {touched.eventName && errors.eventName && (
                <FormHelperText
                  error
                  id="standard-weight-helper-text-email-login"
                >
                  {errors.eventName}
                </FormHelperText>
              )}
            </FormControl>

            <FormControl
              fullWidth
              error={Boolean(touched.date && errors.date)}
              sx={{ ...theme.typography.customInput }}
            >
              <InputLabel htmlFor="outlined-adornment-date" shrink>
                Date
              </InputLabel>
              <OutlinedInput
                id="outlined-adornment-date"
                type="date"
                value={values.date}
                name="date"
                onBlur={handleBlur}
                onChange={handleChange}
                label="Date"
                inputProps={{}}
                sx={{ height: matchDownMd && '3.5rem' }}
              />
              {touched.date && errors.date && (
                <FormHelperText error id="standard-weight-helper-text-date">
                  {errors.date}
                </FormHelperText>
              )}
            </FormControl>
            <Grid container columnSpacing={2}>
              <Grid item xs={6}>
                <FormControl
                  fullWidth
                  error={Boolean(touched.startTime && errors.startTime)}
                  sx={{ ...theme.typography.customInput }}
                >
                  <InputLabel htmlFor="outlined-adornment-start-time" shrink>
                    Start TIme
                  </InputLabel>
                  <OutlinedInput
                    id="outlined-adornment-start-time"
                    type="time"
                    value={values.startTime}
                    name="startTime"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    label="Start Time"
                    inputProps={{}}
                    sx={{ height: matchDownMd && '3.5rem' }}
                  />
                  {touched.startTime && errors.startTime && (
                    <FormHelperText
                      error
                      id="standard-weight-helper-text-startTime"
                    >
                      {errors.startTime}
                    </FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl
                  fullWidth
                  error={Boolean(touched.endTime && errors.endTime)}
                  sx={{ ...theme.typography.customInput }}
                >
                  <InputLabel htmlFor="outlined-adornment-end-time" shrink>
                    End Time
                  </InputLabel>
                  <OutlinedInput
                    id="outlined-adornment-end-time"
                    type="time"
                    value={values.endTime}
                    name="endTime"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    label="End Time"
                    inputProps={{}}
                    sx={{ height: matchDownMd && '3.5rem' }}
                  />
                  {touched.endTime && errors.endTime && (
                    <FormHelperText
                      error
                      id="standard-weight-helper-text-end-time"
                    >
                      {errors.endTime}
                    </FormHelperText>
                  )}
                </FormControl>
              </Grid>
            </Grid>
            <FormControl
              fullWidth
              error={Boolean(touched.location && errors.location)}
              sx={{ ...theme.typography.customInput }}
            >
              <InputLabel htmlFor="outlined-adornment-location">
                Location
              </InputLabel>
              <OutlinedInput
                id="outlined-adornment-location"
                type="text"
                value={values.location}
                name="location"
                onBlur={handleBlur}
                onChange={handleChange}
                label="Location"
                inputProps={{}}
              />
              {touched.location && errors.location && (
                <FormHelperText error id="standard-weight-helper-text-location">
                  {errors.location}
                </FormHelperText>
              )}
            </FormControl>
            {errors.submit && (
              <Box sx={{ mt: 3 }}>
                <FormHelperText error>{errors.submit}</FormHelperText>
              </Box>
            )}

            <Box sx={{ mt: 2 }}>
              <AnimateButton>
                <Button
                  disableElevation
                  disabled={isSubmitting}
                  fullWidth
                  size="large"
                  type="submit"
                  variant="contained"
                  color="secondary"
                >
                  Create
                </Button>
              </AnimateButton>
            </Box>
          </form>
        )}
      </Formik>
    </>
  );
};

export default CreateEventForm;
