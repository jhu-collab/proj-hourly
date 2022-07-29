import create from "zustand";
import { persist } from "zustand/middleware";

// Manages states that involve layout control
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
export const useAccountStore =  create(
  persist(
    (set) => ({
      // TODO: Once backend has set up tokens, this will be replaced.
      id: -1,
      setId: (value) =>
        set((state) => ({
          id: value || -1,
        })),

      name: "John Doe",
      setName: (value) =>
        set((state) => ({
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

//TODO: Refactor this into separate stores
const useStore = create(
  persist(
    (set) => ({
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
