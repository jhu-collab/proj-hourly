import ical from "ical-generator";

export const ics1 = () => {
  const calendar = ical({ name: "Gateway Computing: Java" });

  const startTime = new Date("2022-07-09");
  const endTime = new Date("2022-07-09");
  startTime.setHours(10);
  endTime.setHours(12);
  calendar.createEvent({
    start: startTime,
    end: endTime,
    summary: "Bob's Office Hours",
    description: "It works ;)",
    location: "Zoom",
  });

  return JSON.stringify(calendar);
};
