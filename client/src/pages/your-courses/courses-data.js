import { ics } from "../calendar/calendar-data";

export const studentCourses = [
  {
    id: 1,
    title: "Gateway Computing: Java",
    courseNumber: "500.112",
    semester: "Fall",
    calendarYear: 2022,
    code: "111111",
    calendar: ics(),
  },
  {
    id: 2,
    title: "User Interfaces & Mobile Applications",
    courseNumber: "601.290",
    semester: "Spring",
    calendarYear: 2023,
    code: "222222",
    calendar: ics(),
  },
];

export const staffCourses = [
  {
    id: 3,
    title: "Object Oriented Software Engineering",
    courseNumber: "600.421",
    semester: "Fall",
    calendarYear: "2022",
    code: "333333",
    calendar: ics(),
  },
  {
    id: 4,
    title: "Data Structures",
    courseNumber: "600.226",
    semester: "Spring",
    calendarYear: "2023",
    code: "444444",
    calendar: ics(),
  },
];
