import create from 'zustand';

export const useStore = create((set) => ({

  isHomepage: false,
  setHomepageTrue: () => set({ isHomepage: true }),
  setHomepageFalse: () => set({ isHomepage: false }),

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
    },
  ],
  createCourse: (newCourse) =>
    set((state) => ({ courses: [...state.courses, newCourse] })),
}));
