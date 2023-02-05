import useStoreCourse from "./useStoreCourse";
import useStoreEvent from "./useStoreEvent";
import useStoreLayout from "./useStoreLayout";
import useStoreToken from "./useStoreToken";

export const getMessage = (error) => {
  const genericMessage = "Something went wrong!";
  const axiosErrorMessage = error && error.message;
  const apiErrorMessage =
    error && error.response && error.response.data && error.response.data.msg;
  const message = apiErrorMessage || axiosErrorMessage || genericMessage;
  return message;
};

export const getConfig = (token) => {
  return {
    headers: { Authorization: `Bearer ${token}` },
  };
};

export function useResetStates() {
  const setCourse = useStoreCourse((state) => state.setCourse);
  const setEvent = useStoreEvent((state) => state.setEvent);
  const setDays = useStoreEvent((state) => state.setDays);
  const toggleOpenSidebar = useStoreLayout((state) => state.toggleOpenSidebar);
  const selectSidebarItem = useStoreLayout((state) => state.selectSidebarItem);
  const toggleCourseType = useStoreLayout((state) => state.toggleCourseType);
  const setEventAnchorEl = useStoreLayout((state) => state.setEventAnchorEl);
  const setRegistrationTab = useStoreLayout(
    (state) => state.setRegistrationTab
  );
  const setMobileCalMenu = useStoreLayout((state) => state.setMobileCalMenu);
  const updateToken = useStoreToken((state) => state.updateToken);

  const resetStoreCourse = () => {
    setCourse();
  };

  const resetStoreEvent = () => {
    setEvent({});
    setDays();
  };

  const resetStoreLayout = () => {
    toggleOpenSidebar(false);
    selectSidebarItem("your-courses");
    toggleCourseType("Student");
    setEventAnchorEl();
    setRegistrationTab();
    setMobileCalMenu(false);
  };

  const resetStoreToken = () => {
    updateToken("");
  };

  const resetAll = () => {
    resetStoreCourse();
    resetStoreEvent();
    resetStoreLayout();
    resetStoreToken();
  };

  return {
    resetStoreCourse,
    resetStoreEvent,
    resetStoreLayout,
    resetStoreToken,
    resetAll,
  };
}
