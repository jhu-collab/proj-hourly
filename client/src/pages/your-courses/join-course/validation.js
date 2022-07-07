import * as yup from "yup";

export const joinCourseSchema = yup.object().shape({
  courseCode: yup
    .string()
    .required("Course code is required")
    .matches(/^[a-zA-Z0-9]{6}$/, "Only 6 characters"),
});
