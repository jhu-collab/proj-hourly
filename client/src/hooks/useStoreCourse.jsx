import create from "zustand";
import { persist } from "zustand/middleware";

// Manages states that involves the currently
// selected course
export const useStoreCourse = create(
  persist(
    (set) => ({
      course: null,
      setCourse: (value) =>
        set(() => ({
          course: value || null,
        })),
    }),
    {
      name: "course",
      getStorage: () => localStorage,
      partialize: (state) => ({ course: state.course }),
    }
  )
);

export default useStoreCourse;
