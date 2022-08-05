import CalendarOutlined from "@ant-design/icons/CalendarOutlined";
import UsergroupAddOutlined from "@ant-design/icons/UsergroupAddOutlined";
const icons = {
  CalendarOutlined,
  UsergroupAddOutlined,
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
        url: "/roster",
        icon: icons.UsergroupAddOutlined,
        breadcrumbs: false,
      },
    ],
  };
};
