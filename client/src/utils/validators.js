import * as yup from "yup";

export const createCourseSchema = yup.object().shape({
  title: yup.string().required("Course title is required"),
  number: yup
    .string()
    .matches(/^\d{3}\..{3}$/, "Course number is invalid. Must be xxx.xxx")
    .required("Course number is required"),
  // Need to add validation to ensure semester and year are not before current year
  semester: yup
    .string()
    .oneOf(
      ["Fall", "Winter", "Spring", "Summer"],
      "Please enter a valid semester"
    )
    .required("Semester is required"),
  year: yup
    .number().typeError("Please enter valid year").min(new Date().getFullYear(), "Please enter current or future year")
    .required("Year is required"),
});
