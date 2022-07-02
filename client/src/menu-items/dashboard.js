import { DashboardOutlined } from "@ant-design/icons";
const icons = {
  DashboardOutlined,
};

export const dashboard = {
  id: "group-dashboard",
  title: "Navigation",
  type: "group",
  children: [
    {
      id: "dashboard",
      title: "Dashboard",
      type: "item",
      url: "/",
      icon: icons.DashboardOutlined,
      breadcrumbs: false,
    },
  ],
};
