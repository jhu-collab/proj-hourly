import create from 'zustand';

export const useStore = create((set) => ({
  createPopup: false,
  createPopupOpen: () => set({ createPopup: true }),
  createPopupClose: () => set({ createPopup: false }),

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
