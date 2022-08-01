import DashboardOutlined from "@ant-design/icons/DashboardOutlined";
import BookOutlined from "@ant-design/icons/BookOutlined";
const icons = {
  DashboardOutlined,
  BookOutlined,
};

export const dashboard = {
  id: "group-dashboard",
  title: "Navigation",
  type: "group",
  children: [
    {
      id: "your-courses",
      title: "Your Courses",
      type: "item",
      url: "/courses",
      icon: icons.BookOutlined,
      breadcrumbs: false,
    },
  ],
};
