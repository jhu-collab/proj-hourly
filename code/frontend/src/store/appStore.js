import create from 'zustand';

export const useStore = create((set) => ({
  isHomepage: false,
  setHomepageTrue: () => set({ isHomepage: true }),
  setHomepageFalse: () => set({ isHomepage: false }),

  isCalendar: false,
  setCalendarTrue: () => set({ isCalendar: true }),
  setCalendarFalse: () => set({ isCalendar: false }),

  isStaff: false,
  setIsStaffTrue: () => set({ isStaff: true }),
  setIsStaffFalse: () => set({ isStaff: false }),

  createCoursePopup: false,
  createCoursePopupOpen: () => set({ createCoursePopup: true }),
  createCoursePopupClose: () => set({ createCoursePopup: false }),

  createEventPopup: false,
  createEventPopupOpen: () => set({ createEventPopup: true }),
  createEventPopupClose: () => set({ createEventPopup: false }),

  currentCourse: null,
  setCurrentCourse: (courseTitle, courseNumber, courseSemester, courseYear) =>
    set({
      currentCourse: {
        title: courseTitle,
        number: courseNumber,
        semester: courseSemester,
        year: courseYear,
      },
    }),
  removeCurrentCourse: () => set({ currentCourse: null }),

  courses: [
    {
      id: 1,
      title: 'Gateway Computing: Java',
      number: '500.112',
      semester: 'Fall',
      year: 2022,
      code: '111111',
      role: 'Student'
    },
    {
      id: 2,
      title: 'Object Oriented Software Engineering',
      number: '600.421',
      semester: 'Spring',
      year: 2023,
      code: '222222',
      role: 'Staff'
    },
  ],
  createCourse: (newCourse) =>
    set((state) => ({ courses: [...state.courses, newCourse] })),

  events: [
    {
      title: "Professor Madooei's Office Hours",
      startRecur: '2022-06-26',
      startTime: '10:30:00',
      endTime: '11:30:00',
      daysOfWeek: ['0', '2', '4'],
    },
    {
      title: "Tarik's Office Hours",
      start: '2022-06-27T14:00:00',
      end: '2022-06-27T15:00:00',
    },
    {
      title: "Sofia's Office Hours",
      startRecur: '2022-06-26',
      startTime: '12:00:00',
      endTime: '13:00:00',
      daysOfWeek: ['2', '4', '6'],
    },
    {
      title: "Xinan's Office Hours",
      start: '2022-06-29T17:00:00',
      end: '2022-06-29T18:00:00',
    },
    {
      title: "Chiamaka's Office Hours",
      start: '2022-06-30T13:30:00',
      end: '2022-06-30T14:30:00',
    },
    {
      title: "Samuel's Office Hours",
      start: '2022-07-01T08:00:00',
      end: '2022-07-01T09:00:00',
    },
    {
      title: "Chris's Office Hours",
      start: '2022-07-02T11:00:00',
      end: '2022-07-02T12:00:00',
    },
  ],

  createEvent: (newEvent) =>
    set((state) => ({ events: [...state.events, newEvent] })),

  createEventDate: '',
  setCreateEventDate: (newEventDate) => set({ createEventDate: newEventDate }),

  createEventStartTime: '',
  setCreateEventStartTime: (newEventStartTime) =>
    set({ createEventStartTime: newEventStartTime }),

  createEventEndTime: '',
  setCreateEventEndTime: (newEventEndTime) =>
    set({ createEventEndTime: newEventEndTime }),
}));
