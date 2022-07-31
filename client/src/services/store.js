import create from "zustand";
import { persist } from "zustand/middleware";

// Manages states that involve layout control
export const useLayoutStore = create(
  persist(
    (set) => ({
      openSidebar: false,
      toggleOpenSidebar: (value) =>
        set((state) => ({
          openSidebar: value || !state.openSidebar,
        })),
      selectedSidebarItem: "your-courses",
      selectSidebarItem: (value) =>
        set(() => ({
          selectedSidebarItem: value,
        })),
      courseType: "student",
      toggleCourseType: (value) =>
        set((state) => ({
          courseType:
            value || (state.courseType === "staff" ? "student" : "staff"),
        })),
      eventAnchorEl: null,
      setEventAnchorEl: (value) =>
        set((state) => ({
          eventAnchorEl: value || null,
        })),
    }),
    {
      name: "layout",
      getStorage: () => localStorage,
      partialize: (state) => ({ courseType: state.courseType }),
    }
  )
);

// Manages states that involve theme control
export const useThemeStore = create(
  persist(
    (set) => ({
      colorScheme: "light",
      toggleColorScheme: (value) =>
        set((state) => ({
          colorScheme:
            value || (state.colorScheme === "dark" ? "light" : "dark"),
        })),
    }),
    {
      name: "theme",
      getStorage: () => localStorage,
      partialize: (state) => ({ colorScheme: state.colorScheme }),
    }
  )
);

// Manages states that involves user information
export const useAccountStore = create(
  persist(
    (set) => ({
      // TODO: Once backend has set up tokens, this will be replaced.
      id: -1,
      setId: (value) =>
        set(() => ({
          id: value || -1,
        })),

      name: "John Doe",
      setName: (value) =>
        set(() => ({
          name: value || "John Doe",
        })),
    }),
    {
      name: "account",
      getStorage: () => localStorage,
      partialize: (state) => ({ id: state.id, name: state.name }),
    }
  )
);

// Manages states that involves the currently
// selected course
export const useCourseStore = create(
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

// Manages states that involves the ConfirmPopup
// component
export const useConfirmDialogStore = create((set) => ({
  message: "",
  onSubmit: undefined,
  close: () => set({ onSubmit: undefined }),
}));

// Manages states that involves the currently
// selected event
export const useEventStore = create((set) => ({
  title: "",
  start: null,
  end: null,
  location: "",
  description: {},
  setEvent: (event) =>
    set({
      title: event.title || "",
      start: event.start || null,
      end: event.end || null,
      location: event.location || "",
      description: event.description || {},
    }),
}));
