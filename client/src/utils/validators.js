import * as yup from "yup";

export const createCourseSchema = yup.object().shape({
  title: yup.string().required("Course title is required"),
  courseNumber: yup
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
  calendarYear: yup
    .string()
    .length(4, "Please enter a valid year")
    .required("Year is required"),
});

export const joinCourseSchema = yup.object().shape({
  courseCode: yup
    .string()
    .required("Course code is required")
    .length(6, "Course code must be 6 characters"),
});
