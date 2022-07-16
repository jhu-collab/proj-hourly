import create from "zustand";
import { persist } from "zustand/middleware";

//TODO: Refactor this into separate stores
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

      // TODO: Once backend has set up tokens, this will be replaced.
      userId: -1,
      setUserId: (value) =>
        set((state) => ({
          userId: value || -1,
        })),

      userName: "John Doe",
      setUserName: (value) =>
        set((state) => ({
          userName: value || "John Doe",
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

export const useConfirmDialogStore = create((set) => ({
  message: "",
  onSubmit: undefined,
  close: () => set({ onSubmit: undefined }),
}));

export const useEventStore = create((set) => ({
  title: "",
  start: new Date(),
  end: new Date(),
  location: "",
  description: {},
  setEvent: (event) =>
    set({
      title: event.title,
      start: event.start,
      end: event.end,
      location: event.extendedProps.location,
      description: JSON.parse(event.extendedProps.description),
    }),
}));

export const useEventPopupStore = create((set) => ({
  open: false,
  togglePopup: (value) =>
    set((state) => ({
      open: value || !state.open,
    })),
}));

export default useStore;
