import { DateTime } from "luxon";
import * as yup from "yup";

export const loginSchema = yup.object().shape({
  username: yup.string().min(1, "Username must be 1 or more characters"),
  password: yup.string().min(1, "Password must be 1 or more characters"),
});

/**
 * Returns a Date object that represents the last day
 * of a specified semester and year. Currently, we are using fixed
 * values, however, it would be nice if the dates updated for every
 * new academic year.
 * @param {String} semester String representing the semester
 * @param {String} year String representing the year
 * @return A Date object that represents the last day
 * of the specified semester and year
 */
const getLastDaySemester = (semester, year) => {
  // TODO: Is there a way to retrieve the last day
  // of each semester automatically?
  if (semester === "Fall") {
    return new Date(`${year}-12-07`);
  } else if (semester === "Winter") {
    return new Date(`${year}-01-22`);
  } else if (semester === "Summer") {
    return new Date(`${year}-08-18`);
  }
  return new Date(`${year}-04-30`);
};

export const createCourseSchema = yup.object().shape({
  title: yup.string().required("Course title is required"),
  number: yup
    .string()
    .matches(/^\d{3}\..{3}$/, "Course number is invalid. Must be xxx.xxx")
    .required("Course number is required"),
  semester: yup
    .string()
    .oneOf(
      ["Fall", "Winter", "Spring", "Summer"],
      "Please enter a valid semester"
    )
    .required("Semester is required")
    .test(
      "is-semester-before",
      "Please enter a current or future semester",
      function (value) {
        const { year } = this.parent;

        let semesterObj = getLastDaySemester(value, year);
        const now = new Date();

        if (now.getTime() < semesterObj.getTime()) {
          return true;
        }
        return false;
      }
    ),
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
  startDate: yup
    .date()
    .typeError("Please enter a valid date")
    .min(today, `Date must be on or after ${today.toLocaleDateString()}`)
    .required("Date is required"),
  recurringEvent: yup.boolean(),
  endDate: yup
    .date()
    .nullable()
    .when("recurringEvent", {
      is: true,
      then: yup
        .date()
        .typeError("Please enter a valid date")
        .required("Date is required")
        .test(
          "is-greater",
          "End date must be after start date",
          function (value) {
            const { startDate } = this.parent;
            return DateTime.fromJSDate(value) > DateTime.fromJSDate(startDate);
          }
        ),
    }),
  days: yup
    .array()
    .nullable()
    .when("recurringEvent", {
      is: true,
      then: yup
        .array()
        .typeError("Please select at least one recurring day")
        .min(1, "Please select at least one recurring day"),
    }),
  startTime: yup.string().required("Start time is required"),
  endTime: yup
    .string()
    .required("End time is required")
    .test("is-greater", "End time must be past start time", function (value) {
      const { startTime } = this.parent;
      return (
        DateTime.fromFormat(value, "T") > DateTime.fromFormat(startTime, "T")
      );
    }),
  location: yup.string().required("Location is required"),
  timeInterval: yup
    .number()
    .typeError("Time limit is required")
    .positive("Please enter a valid time limit")
    .integer("Please enter a valid time limit")
    .required(),
});

export const inviteUserSchema = yup.object().shape({
  email: yup
    .string()
    .email("Must be a valid email")
    .max(255)
    .required("Email is required"),
});

export const registerSchema = yup.object().shape({
  times: yup.string().required("Please select a time slot"),
});

export const profileSchema = yup.object({
  id: yup.number().transform((val) => Number(val)),
  username: yup.string().min(1, "Username cannot be empty"),
  firstName: yup.string().min(1, "First name cannot be empty"),
  preferredName: yup.string(),
  lastName: yup.string().min(1, "Last name cannot be empty"),
  email: yup.string().email("Invalid email"),
  role: yup.string(),
});

export const registrationTypeSchema = yup.object({
  name: yup.string().required("Registration name is required"),
  duration: yup
    .number()
    .required("Duration is required")
    .min(5, "Duration must be at least 5 minutes")
    .typeError("Please enter a valid duration"),
});

export const topicSchema = yup.object({
  name: yup.string().required("Topic name is required"),
});
