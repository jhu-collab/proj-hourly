import create from "zustand";
import { persist } from "zustand/middleware";

export const useLayoutStore = create((set) => ({
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
}));

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
      joinCoursePopup: false,
      toggleJoinCoursePopup: (value) =>
        set((state) => ({
          joinCoursePopup: value || !state.joinCoursePopup,
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

export const useEventPopupStore = create((set) => ({
  open: false,
  togglePopup: (value) =>
    set((state) => ({
      open: value || !state.open,
    })),
}));

export const useEditEventPopupStore = create((set) => ({
  open: false,
  togglePopup: (value) =>
    set((state) => ({
      open: value || !state.open,
    })),
}));

export const useRegisterPopupStore = create((set) => ({
  open: false,
  togglePopup: (value) =>
    set((state) => ({
      open: value || !state.open,
    })),
}));

export default useStore;
