import create from "zustand";
import { persist } from "zustand/middleware";

const useStore = create(
  persist(
    (set) => ({
      openSidebar: false,
      toggleOpenSidebar: (value) =>
        set((state) => ({
          openSidebar: value || !state.openSidebar,
        })),
      selectedSidebarItem: "your-courses",
      selectSidebarItem: (value) =>
        set((state) => ({
          selectedSidebarItem: value,
        })),
      colorScheme: "light",
      toggleColorScheme: (value) =>
        set((state) => ({
          colorScheme:
            value || (state.colorScheme === "dark" ? "light" : "dark"),
        })),
      courseType: "student",
      toggleCourseType: (value) =>
        set((state) => ({
          courseType:
            value || (state.courseType === "staff" ? "student" : "staff"),
        })),
      createCoursePopup: false,
      toggleCreateCoursePopup: (value) =>
        set((state) => ({
          createCoursePopup: value || !state.createCoursePopup,
        })),
      currentCourse: null,
      updateCurrentCourse: (newCourse) => set((state) => ({
        currentCourse: newCourse || null,
      })),
      createEventPopup: false,
      toggleCreateEventPopup: (value) =>
        set((state) => ({
          createEventPopup: value || !state.createEventPopup,
        })),
    }),
    {
      name: "theme",
      getStorage: () => localStorage,
      partialize: (state) => ({ colorScheme: state.colorScheme }),
    }
  )
);

export default useStore;
