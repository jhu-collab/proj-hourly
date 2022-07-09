import ical from "ical-generator";

export const ics1 = () => {
  const calendar = ical({ name: "Gateway Computing: Java" });

  calendar.createEvent({
    summary: "Professor Madooei's Office Hours",
    start: new Date("2022-06-26T10:30:00"),
    end: new Date("2022-06-26T11:30:00"),
    location: "Zoom",
    repeating: {
        freq: 'WEEKLY',
        byDay: ['mo', 'we', 'fr']
    }
  });

  calendar.createEvent({
    summary: "Tarik's Office Hours",
    start: new Date("2022-06-27T14:00:00"),
    end: new Date("2022-06-27T15:00:00"),
    location: "Zoom",
    repeating: {
        freq: 'WEEKLY',
        byDay: ['mo', 'we', 'fr']
    }
  });

  calendar.createEvent({
    summary: "Sofia's Office Hours",
    start: new Date("2022-06-27T12:00:00"),
    end: new Date("2022-06-27T13:00:00"),
    location: "Zoom",
    repeating: {
        freq: 'WEEKLY',
        byDay: ['tu', 'th', 'sa']
    }
  });

  calendar.createEvent({
    summary: "Xinan's Office Hours",
    start: new Date("2022-06-27T17:00:00"),
    end: new Date("2022-06-27T18:00:00"),
    location: "Zoom",
    repeating: {
        freq: 'WEEKLY',
        byDay: ['tu', 'th', 'sa']
    }
  });

  calendar.createEvent({
    summary: "Chiamaka's Office Hours",
    start: new Date("2022-07-10T17:00:00"),
    end: new Date("2022-07-10T18:00:00"),
    location: "Zoom",
  });

  calendar.createEvent({
    summary: "Chris's Office Hours",
    start: new Date("2022-07-10T11:00:00"),
    end: new Date("2022-07-10T12:00:00"),
    location: "Zoom",
  });

  calendar.createEvent({
    summary: "Samuel's Office Hours",
    start: new Date("2022-07-10T08:00:00"),
    end: new Date("2022-07-10T09:00:00"),
    location: "Zoom",
  });

  return JSON.stringify(calendar);
};
