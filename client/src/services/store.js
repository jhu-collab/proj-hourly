import create from "zustand";
import { persist } from "zustand/middleware";
import Debug from "debug";

const debug = new Debug(`hourly:services:store.js`);

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
      timeTab: 0,
      setTimeTab: (value) =>
        set(() => ({
          timeTab: value || 0,
        })),
      mobileCalMenu: false,
      setMobileCalMenu: (value) =>
        set((state) => ({
          mobileCalMenu: value || !state.mobileCalMenu,
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
