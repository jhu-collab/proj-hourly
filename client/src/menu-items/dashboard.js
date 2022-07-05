import { DashboardOutlined, BookOutlined } from "@ant-design/icons";
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
      url: "/",
      icon: icons.BookOutlined,
      breadcrumbs: false,
    },
    {
      id: "dashboard",
      title: "Dashboard",
      type: "item",
      url: "/dashboard",
      icon: icons.DashboardOutlined,
      breadcrumbs: false,
    },
  ],
};
