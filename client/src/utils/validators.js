import moment from "moment";
import { string } from "prop-types";
import * as yup from "yup";

export const loginSchema = yup.object().shape({
  email: yup
    .string()
    .email("Must be a valid email")
    .max(255)
    .required("Email is required"),
});

const PHONE_NO_REGEX = /^\(?([0-9]{3})\)?[-]{1}([0-9]{3})[-]{1}([0-9]{4})$/;

export const signUpSchema = yup.object().shape({
  name: yup.string().max(255).required("Name is required"),
  email: yup
    .string()
    .email("Must be a valid email")
    .max(255)
    .required("Email is required"),
  phoneNumber: yup
    .string()
    .matches(PHONE_NO_REGEX, "Phone number is invalid")
    .nullable()
    .transform((value) => (!!value ? value : undefined)),
});

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

const today = new Date();
today.setHours(0, 0, 0, 0);

export const createEventSchema = yup.object().shape({
  date: yup
    .date()
    .typeError("Please enter a valid date")
    .min(today, `Date must be on or after ${today.toLocaleDateString()}`)
    .required("Date is required"),
  startTime: yup.string().required("Start time is required"),
  endTime: yup
    .string()
    .required("End time is required")
    .test("is-greater", "End time must be past start time", function (value) {
      const { startTime } = this.parent;
      return moment(value, "HH:mm").isAfter(moment(startTime, "HH:mm"));
    }),
  location: yup.string().required("Location is required"),
});

export const registerSchema = yup.object().shape({
  times: yup.string().required("Please select a time slot"),
});
