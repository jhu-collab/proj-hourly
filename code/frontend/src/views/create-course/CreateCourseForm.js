// material-ui
import { useTheme } from '@mui/material/styles';
import {
    Box,
    Button,
    FormControl,
    FormHelperText,
    InputLabel,
    OutlinedInput,
} from '@mui/material';

// third party
import * as Yup from 'yup';
import { Formik } from 'formik';

// project imports
import useScriptRef from 'hooks/useScriptRef';
import AnimateButton from 'ui-component/extended/AnimateButton';
import { useStore } from 'store/appStore';


// ============================|| CREATE COURSE FORM ||============================ //

const CreateCourseForm = ({ ...others }) => {
    const theme = useTheme();
    const scriptedRef = useScriptRef();
    const createCourse = useStore((state) => state.createCourse);
    const createPopupClose = useStore((state) => state.createPopupClose);
  
    return (
        <>
            <Formik
                initialValues={{
                    title: '',
                    number: '',
                    semester: '',
                    year: '',
                }}
                validationSchema={Yup.object().shape({
                    title: Yup.string().required('Course title is required'),
                    number: Yup.string().matches(/^\d{3}\..{3}$/, 'Course number is invalid. Must be xxx.xxx').required('Course number is required'),
                    // Need to add validation to ensure semester and year are not before current year
                    semester: Yup.string().oneOf(["Fall", "Winter", "Spring", "Summer"], "Please enter a valid semester").required('Semester is required'),
                    year: Yup.string().matches(/^[0-9]{4}$/, "Please enter a valid year").required("Year is required")
                })}
                onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
                    try {
                        if (scriptedRef.current) {
                            setStatus({ success: true });
                            setSubmitting(false);
                            const course = {title: values.title, number: values.number, semester: values.semester, year: values.year};
                            console.log(course);
                            createCourse(course);
                            createPopupClose();
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
                {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
                    <form noValidate onSubmit={handleSubmit} {...others}>
                        <FormControl fullWidth error={Boolean(touched.title && errors.title)} sx={{ ...theme.typography.customInput }}>
                            <InputLabel htmlFor="outlined-adornment-email-login">Course Title</InputLabel>
                            <OutlinedInput
                                id="outlined-adornment-course-title"
                                type="text"
                                value={values.title}
                                name="title"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                label="Course Title"
                                inputProps={{}}
                            />
                            {touched.title && errors.title && (
                                <FormHelperText error id="standard-weight-helper-text-email-login">
                                    {errors.title}
                                </FormHelperText>
                            )}
                        </FormControl>

                        <FormControl
                            fullWidth
                            error={Boolean(touched.number&& errors.number)}
                            sx={{ ...theme.typography.customInput }}
                        >
                            <InputLabel htmlFor="outlined-adornment-course-number">Course Number</InputLabel>
                            <OutlinedInput
                                id="outlined-adornment-course-number"
                                type="text"
                                value={values.number}
                                name="number"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                label="Course Number"
                                inputProps={{}}
                            />
                            {touched.number && errors.number && (
                                <FormHelperText error id="standard-weight-helper-text-course-number">
                                    {errors.number}
                                </FormHelperText>
                            )}
                        </FormControl>
                        <FormControl
                            fullWidth
                            error={Boolean(touched.semester&& errors.semester)}
                            sx={{ ...theme.typography.customInput }}
                        >
                            <InputLabel htmlFor="outlined-adornment-semester">Semester</InputLabel>
                            <OutlinedInput
                                id="outlined-adornment-semesterr"
                                type="text"
                                value={values.semester}
                                name="semester"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                label="Semester"
                                inputProps={{}}
                            />
                            {touched.semester && errors.semester && (
                                <FormHelperText error id="standard-weight-helper-text-year">
                                    {errors.semester}
                                </FormHelperText>
                            )}
                        </FormControl>
                        <FormControl
                            fullWidth
                            error={Boolean(touched.year&& errors.year)}
                            sx={{ ...theme.typography.customInput }}
                        >
                            <InputLabel htmlFor="outlined-adornment-year">Year</InputLabel>
                            <OutlinedInput
                                id="outlined-adornment-year"
                                type="text"
                                value={values.year}
                                name="year"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                label="Year"
                                inputProps={{}}
                            />
                            {touched.year && errors.year && (
                                <FormHelperText error id="standard-weight-helper-text-year">
                                    {errors.year}
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

export default CreateCourseForm;
