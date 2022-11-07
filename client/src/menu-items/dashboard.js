import DashboardOutlined from "@ant-design/icons/DashboardOutlined";
import ReadOutlined from "@ant-design/icons/ReadOutlined";
const icons = {
  DashboardOutlined,
  ReadOutlined,
};

export const dashboard = {
  id: "group-dashboard",
  type: "group",
  children: [
    {
      id: "your-courses",
      title: "my courses",
      type: "item",
      url: "/",
      icon: icons.ReadOutlined,
      breadcrumbs: false,
    },
  ],
};
