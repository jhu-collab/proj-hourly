import create from "zustand";
import { persist } from "zustand/middleware";

// Manages states that involve layout control
export const useStoreLayout = create(
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
      registrationTab: 0,
      setRegistrationTab: (value) =>
        set(() => ({
          registrationTab: value || 0,
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

export default useStoreLayout;
