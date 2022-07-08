import {
  DashboardOutlined,
  BookOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
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
    ],
  };
};
