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
      joinCoursePopup: false,
      toggleJoinCoursePopup: (value) =>
        set((state) => ({
          joinCoursePopup: value || !state.joinCoursePopup,
      currentCourse: null,
      updateCurrentCourse: (value) =>
        set((state) => ({
          currentCourse: value || null,
        })),
      createEventPopup: false,
      toggleCreateEventPopup: (value) =>
        set((state) => ({
          createEventPopup: value || !state.createEventPopup,
        })),

      createEventDate: "",
      setCreateEventDate: (value) =>
        set((state) => ({
          createEventDate: value || "",
        })),
      createEventStartTime: "",
      setCreateEventStartTime: (value) =>
        set((state) => ({
          createEventStartTime: value || "",
        })),
      createEventEndTime: "",
      setCreateEventEndTime: (value) =>
        set((state) => ({
          createEventEndTime: value || "",
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
