import DashboardOutlined from "@ant-design/icons/DashboardOutlined";
import BookOutlined from "@ant-design/icons/BookOutlined";
import CalendarOutlined from "@ant-design/icons/CalendarOutlined";
const icons = {
  DashboardOutlined,
  BookOutlined,
  CalendarOutlined,
};

export const course = (currentCourse) => {
  return {
    id: "group-course",
    title: currentCourse.title,
    type: "group",
    children: [
      {
        id: "calendar",
        title: "Calendar",
        type: "item",
        url: "/calendar",
        icon: icons.CalendarOutlined,
        breadcrumbs: false,
      },
      {
        id: "roster",
        title: "Roster",
        type: "item",
        url: "/roster-test",
        //TODO
        icon: icons.CalendarOutlined,
        breadcrumbs: false,
      },
    ],
  };
};
