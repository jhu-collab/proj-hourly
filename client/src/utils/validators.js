import * as yup from "yup";

const CURRENT_DATE_STR = new Date().toLocaleDateString();

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
    .number()
    .typeError("Please enter valid year")
    .min(new Date().getFullYear(), "Please enter current or future year")
    .required("Year is required"),
});

export const joinCourseSchema = yup.object().shape({
  code: yup
    .string()
    .required("Course code is required")
    .length(6, "Course code must be 6 characters"),
});

export const createEventSchema = yup.object().shape({
  date: yup
    .date()
    .typeError("Please enter a valid date")
    .min(CURRENT_DATE_STR, `Date must be on or after ${CURRENT_DATE_STR}`)
    .required("Date is required"),
  // TODO: Add further validation for the startTime and endTime fields
  startTime: yup.string().required("Start time is required"),
  endTime: yup.string().required("End time is required"),
  location: yup.string().required("Location is required"),
});
